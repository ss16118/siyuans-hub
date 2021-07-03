<h1 align="center">重复造轮子的喜悦</h1>
<h3 align="center">从零开始用C++写一个最基础的BitTorrent客户端</h3>

前几个月开始实习，平时闲着的时候想学学C++。根据以往的经验，学一门语言最快的方法就是用它完成一个项目。在知乎上无意中发现了一个挺有意思的Github repo，叫[Build Your Own X](https://github.com/danistefanovic/build-your-own-x)，上面收集了不少tutorial教你从零开始实现各种软件还有工具。看了一圈觉得BitTorrent client是个不错的项目，难度不是很大，恰好我上学期学完分布式算法的课程之后对P2P网络也有点兴趣。这个项目是我在工作之余抽空写的，很多时候下班了不想写代码，拖拖拉拉一两周才会写几个function，再加上对语言不熟，要查资料什么的，前前后后总共花了两个月才写完。源代码可以再我的[Github repo](https://github.com/ss16118/torrent-client-cpp/)里找到。这里用C++举例，简单介绍一下从零开始实现一个最基础的BiTorrent客户端的主要步骤。如果你最近正好找个项目上手一门新的语言，那你一定不会失望。


<h3>主要内容</h3>

- [BitTorrent协议](#BitTorrent协议)
- [解析.torrent文件](#解析.torrent文件)
- [获取Peers](#获取Peers)
- [和Peers沟通](#和Peers沟通)
  - [BitTorrent握手](#BitTorrent握手)
  - [交换信息](#交换信息)
- [管理Pieces](#管理Pieces)
  - [Piece](#Piece)
  - [PieceManager](#PieceManager)
- [多线程下载](#多线程下载)
- [总结](#总结)
- [参考](#参考)

### BitTorrent协议

相信听说过Torrent Project或是用过海盗湾的人对BitTorrent协议应该都不会陌生。它由大佬Bram Cohen在2001年设计并发布。BitTorrent是一个处于应用层的用于文件传输的通信协议。简单来说，当我们通过BitTorrent下载文件的时候，数据的来源并不是服务器，而是拥有相同文件的用户。换句话讲，在用BitTorrent的时候，我们既是文件的下载者，也是文件的提供者。这就是为什么一个文件越火，下载的人越多，下载的速度也就越快。先声明一下，这里实现的BitTorrent客户端只支持最基础的下载功能，为别的用户提供文件（做种）并不支持。


### 解析.torrent文件

要实现下载文件的功能，我们得知道需要下载的文件是什么以及去哪儿才能找到拥有数据的用户（Peer）。这些信息一般都能在.torrent文件（也就是大家俗称的种子文件）里找到。有点麻烦的是.torrent文件的信息存储用的是一种叫Bencode（读作B-encode）的编码。因此想要读取有用的内容，首先要做的就是解析（parse）.torrent文件。

Bencode并不复杂，它只支持四种类型，分别是字符串（String），整数（Integer），串列（List）以及字典表（Dictionary），本质上和JSON一样。它的语法也很简单，Augmented Backus-Naur Form（ABNF）如下：

```
bencode ::= dict / list / int / str
dict    ::= "d" 1 * (str bencode) "e"
list    ::= "l" 1 * bencode "e"
int     ::= "i" snum "e"
str     ::= num ":" n * CHAR  ; n是字符的个数

snum    ::= "-" num / num
num     ::= 1 * DIGIT
```

.torrent文件的具体结构可以在[BitTorrent的Specification](https://wiki.theory.org/BitTorrentSpecification#Metainfo_File_Structure)里找到。如果把用作例子的.torrent文件的内容排版得美观一点的话（.torrent文件来自[The Moral Psychology Handbook](https://academictorrents.com/details/90493c18f577d24d5646c5075193bf57faabdcf6)）：

```
d
  8:announce
    41:https://academictorrents.com/announce.php
  7:comment
    90:Torrent of academic paper https://www.tandfonline.com/doi/abs/10.1080/09515089.2012.729488
  10:created by
    14:uTorrent/3.5.5
  13:creation date
    i1566236877e
  8:encoding
    5:UTF-8
  4:info
    d
      6:length
        i150932e
      4:name
        22:MoralPsychHandbook.pdf
      12:piece length
        i16384e
      6:pieces
        200:�����PS�^��... (字符串长度为200的二进制数据)
    e
e
```

我因为怕麻烦（主要是因为编译原理学的怎么写parser都忘光了），所以用了Petr Zemek写的[C++ Bencoding](https://github.com/s3rvac/cpp-bencoding)的库。为了省事，我也没有把parse完的数据放进struct里，而是把所有和.torrent文件解析有关的部分都放进了一个叫`TorrentFileParser`的class。假设我需要`announce`的值，我只需要调用`TorrentFileParser`里的`getAnnounce()`这个函数就行了。具体的实现可以参考我的[源代码](https://github.com/ss16118/torrent-client-cpp/blob/main/src/TorrentFileParser.cpp)。其实这第一步不管具体方法如何，只要能做到parse .torrent文件，提取我们需要的数据就行。值得注意的是这里的**pieces**指的是我们想下载的数据的每一个piece的hash的拼接，详细内容会在下面的部分中介绍。

### 获取Peers

解析完.torrent文件，接下来要做的是和Tracker联系来获取和peer有关的信息。这里的Tracker指的是储存了下载者（上传者）信息的服务器，如果想知道哪些用户有我们要下载文件，可以向Tracker发送请求。这有那么一点像早期Napster的杂P2P。Tracker的URL就是.torrent文件里的`announce`。我们要做的首先是向这个URL发送一个HTTP GET请求。我不太想用libcurl，所以选了一个叫[cpr](https://github.com/whoshuu/cpr)的库（其实本质上是libcurl的wrapper），这样写起来方便省事。

```cpp
cpr::Response res = cpr::Get(cpr::Url{announceUrl}, cpr::Parameters {
    { "info_hash", std::string(hexDecode(infoHash)) },
    { "peer_id", std::string(peerId) },
    { "port", std::to_string(port) },
    { "uploaded", std::to_string(0) },
    { "downloaded", std::to_string(bytesDownloaded) },
    { "left", std::to_string(fileSize - bytesDownloaded) },
    { "compact", std::to_string(1) }
  }, cpr::Timeout{ TRACKER_TIMEOUT }
);
// If response successfully retrieved
if (res.status_code == 200)
{
    LOG_F(INFO, "Retrieve response from tracker: SUCCESS");
    std::vector<Peer*> peers = decodeResponse(res.text);
}
else
{
    LOG_F(ERROR, "Retrieving response from tracker: FAILED [ %d: %s ]", res.status_code, res.text.c_str());
}
```

这里简单地介绍一下GET请求所需要的参数（parameters）：

| 参数      	| 介绍                               	|
|-----------	|------------------------------------	|
| info_hash 	| .torrent文件info字典表的SHA1哈希值 	|
| peer_id   	| 我们客户端的ID                     	|
| uploaded   	| 已经上传的数据（单位：字节）           	|
| downloaded	| 已经下载的数据（单位：字节）           	|
| left      	| 还需下载的数据（单位：字节）           	|
| port       	| 我们客户端要用到的TCP端口            	|
| compact    	| 如果值为1，代表我们愿意接收简洁的回复  	|

有些参数比较好理解，像uploaded还有downloaded，不需要太多解释，这里挑几个不是很直观的讲讲：

- **info_hash**：每个.torrent文件里都包含一个叫名称（key）为“info”的字典表，这里的info_hash指的就是"info"这个字典表里所有值（value）字符串形式的SHA1哈希。我第一次看到info_hash是时候有点晕乎，当时看了SOF上面老哥们的回答才恍然大悟，这里附上[SOF的帖子](https://stackoverflow.com/questions/28348678/what-exactly-is-the-info-hash-in-a-torrent-file)。
- **peer_id**：20字节长的ID，用来区分我们和别人的客户端。举个例子：-UT2049-194819401932。这里的UT2049用来标示我们客户端所用的软件以及版本，“-”后面的12个字节只要是数字和字母就行。详细信息参考[BitTorrent Specification](https://wiki.theory.org/BitTorrentSpecification#peer_id)。
- **compact**：一般来说值为1。所谓简洁（compact）指的是收到的回复里代表每一个peer的信息都只有6个字节。假设一个peer被表示为 **"\xC0\x00\x02\x7B\x1A\xE1"**，前4个字节代表了这个peer的IP地址，后两个字节代表它的端口。如果写成数字的话，这个peer就是“192.0.2.123:6881”。需要注意的是最后两个字节的排列是network order，也就是big endian，转成host整数的时候要小心。如果不是compact格式，peers有关的信息会是一个Bencode编码的串列，直接用parser解析就行。

这里Tracker的回复是一串Bencode编码，基本上格式如下：

```
d
  8:interval
    i(整数)e
  5:peers
    n:(所有peer的信息)
e
```

**interval**代表需要隔多久向这个Tracker发送请求。**peers**就是上文在介绍compact的时候提到的编码。这里放一段用来decode peer信息的代码：

```cpp
struct Peer
{
    std::string ip;
    int port;
};

// peerInfoSize的值为6
// peerString是Tracker回复的字典表里"peers"的值
// bytesToInt()是用来把字符串里每个字节拼接并且转成整数的函数

const int peerNum = peersString.length() / peerInfoSize;
for (int i = 0; i < peerNum; i++)
{
    int offset = i * peerInfoSize;
    std::stringstream peerIp;
    peerIp << std::to_string((uint8_t) peersString[offset]) << ".";
    peerIp << std::to_string((uint8_t) peersString[offset + 1]) << ".";
    peerIp << std::to_string((uint8_t) peersString[offset + 2]) << ".";
    peerIp << std::to_string((uint8_t) peersString[offset + 3]);
    int peerPort = bytesToInt(peersString.substr(offset + 4, 2));
    Peer* newPeer = new Peer { peerIp.str(), peerPort };
    peers.push_back(newPeer);
}
```
有关peer获取的代码我都放在了一个叫[`PeerRetriever`](https://github.com/ss16118/torrent-client-cpp/blob/main/src/PeerRetriever.cpp)的class里，可以提供参考。

### 和Peers沟通

得到peer的信息之后，接下来要做的自然是和每一个peer联系并且请求下载数据。第一步要做的是和peer建立TCP连接。用C++写的话，代码如下。说实话我对socket programming一点了解都没有，代码也基本上都是借鉴SOF和各种tutorial，尤其是因为需要加入timeout，还涉及到blocking和nonblocking，所以看上去估计比较乱，还请大家见谅。

```cpp

int createConnection(const std::string& ip, const int port)
{
    int sock = 0;
    struct sockaddr_in address;
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0)
        throw std::runtime_error("Socket creation error: " + std::to_string(sock));

    address.sin_family = AF_INET;
    address.sin_port = htons(port);

    char* tempIp = new char[ip.length() + 1];
    strcpy(tempIp, ip.c_str());

    // Converts IP address from string to struct in_addr
    if (inet_pton(AF_INET, tempIp, &address.sin_addr) <= 0)
        throw std::runtime_error("Invalid IP address: " + ip);

    // Sets socket to non-block mode
    if (!setSocketBlocking(sock, false))
        throw std::runtime_error("An error occurred when setting socket " + std::to_string(sock) + "to NONBLOCK");

    connect(sock, (struct sockaddr *) &address, sizeof(address));

    fd_set fdset;
    struct timeval tv;
    FD_ZERO(&fdset);
    FD_SET(sock, &fdset);
    tv.tv_sec = CONNECT_TIMEOUT;
    tv.tv_usec = 0;

    if (select(sock + 1, NULL, &fdset, NULL, &tv) == 1)
    {
        int so_error;
        socklen_t len = sizeof so_error;

        getsockopt(sock, SOL_SOCKET, SO_ERROR, &so_error, &len);

        if (so_error == 0)
        {
            // Sets socket to blocking mode
            if (!setSocketBlocking(sock, true))
                throw std::runtime_error("An error occurred when setting socket " + std::to_string(sock) + "to BLOCK");
            return sock;
        }
    }
    close(sock);
    throw std::runtime_error("Connect to " + ip + ": FAILED [Connection timeout]");
}
```

##### BitTorrent握手

建立好了TCP连接，我们首先要向peer发送一个BitTorrent的握手（handshake）信息。BitTorrent协议里的握手和TCP的三次握手有点像，主要目的是用来确认对方同样使用BitTorrent协议以及确实有我们想要的文件。这个握手信息包含5个部分：

1. 协议标识符（Protocol identifier）的长度，这里固定用19（16进制的话就是0x13）。
2. 协议标识符，用来标记这条信息使用的协议的字符串，固定用“BitTorrent”。
3. 保留字节（reserved bytes），长度为8个字节，全部都为0，填成 **\x00\x00\x00\x00\x00\x00\x00\x00**就行。
4. 在解析.torrent文件时通过计算获得的info_hash。
5. 我们自己客户端的ID。
  
举个例子，握手信息大概长这样：

```
\x13BitTorrent protocol\x00\x00\x00\x00\x00\x00\x00\x00\x86\xd4\xc8\x00\x24\xa4\x69\xbe\x4c\x50\xbc\x5a\x10\x2c\xf7\x17\x80\x31\x00\x74-UT2049-194819401932
```

如果发送的数据没有出错的话，应该立刻就能收到peer回复的相同格式的握手信息。收到的时候记得把我们自己计算得出的info_hash和对方回复的info_hash比较，如果相同再进行下一步。

##### 交换信息

完成上一步之后就可以和peer交换别的信息了。这里先介绍一下BitTorrent信息（message）的基本格式：
```
<length><id><payload>
```

- **length**：id和payload的总长度，单位为字节。
- **id**：用来识别不同类型的信息。比如接下来会讲到的bitfield信息的id为5，unchoke信息的id为1.长度为1字节。
- **payload**：可有可无，长度和内容由信息类型决定。

在正式向peer发送下载请求之前，还有几条信息需要处理。首先在接受了peer的握手之后，会收到一条bitfield信息，它的payload是一串位数组（bit array），也就是c里的bitmap。payload里比特的个数等于我们想要下载的文件被分成piece的总个数，每一个比特代表这个peer是否拥有这个piece。假如说我们想要的文件被分成了8个pieces，那我们收到的bitfield有可能是10100000。1代表现在和我们联系的peer有这个piece，只需要发送请求就能下载，0则代表它现在没有这个piece。因此只要观察哪个位置的比特是0，哪个是1就能确定peer有没有某个piece。按上面举的例子10100000来说的话就是这个peer只有piece 0和piece 2。

每一个客户端和peer取得联系后的初始状态都是**uninterested**和**choked**。uninterested指的是我们并没有向peer请求数据的兴趣。choked指的是我们无法向peer请求任何数据。按字面意思形象地理解就是我们被peer掐住（choke）了，只有对面把手松开才能出声。因此在收到了bitfield之后，当务之急是向peer发送一条**interested**信息，只有这样对方才能松手（**unchoke**）。

整个沟通以及接法信息的流程如下：

```
          Handshake
客户端 --------------> peer

          Handshake
客户端 <-------------- peer

          BitField
客户端 <-------------- peer

         Interested
客户端 --------------> peer

           Unchoke
客户端 <-------------- peer
```

代码方面的话，我写了一个叫[`BitTorrentMessage`](https://github.com/ss16118/torrent-client-cpp/blob/main/src/BitTorrentMessage.cpp)的class，用来表示不同的BitTorrent信息。所有和peer沟通的代码都能在[`PeerConnection`](https://github.com/ss16118/torrent-client-cpp/blob/main/src/PeerConnection.cpp)里找到。[connect.cpp](https://github.com/ss16118/torrent-client-cpp/blob/main/src/connect.cpp)里放了和socket programming有关的代码。

```cpp
enum MessageId
{
    keepAlive = -1,
    choke = 0,
    unchoke = 1,
    interested = 2,
    notInterested = 3,
    have = 4,
    bitField = 5,
    request = 6,
    piece = 7,
    cancel = 8,
    port = 9
};

class BitTorrentMessage
{
private:
    const uint32_t messageLength;
    const uint8_t id;
    const std::string payload;
public:
    explicit BitTorrentMessage(uint8_t id, const std::string& payload = "");
    std::string toString();
    uint8_t getMessageId() const;
    std::string getPayload() const;
};


/**
 * 把从socket里读取的数据转换为BitTorrentMessage
 */
BitTorrentMessage PeerConnection::receiveMessage(int bufferSize) const {
    std::string reply = receiveData(sock, 0);
    if (reply.empty())
        return BitTorrentMessage(keepAlive);
    auto messageId = (uint8_t) reply[0];
    std::string payload = reply.substr(1);
    LOG_F(INFO, "Received message with ID %d from peer [%s]", messageId, peer->ip.c_str());
    return BitTorrentMessage(messageId, payload);
}

```

这部分讲得有点含糊，很多BitTorrent信息都没有提到，如果想了解具体的细节，还请参考[specification](https://wiki.theory.org/BitTorrentSpecification#Messages)。

### 管理Pieces

#### Piece

在开始数据下载和管理之前，首先介绍一下BitTorrent里piece的概念和构成。在用BitTorrent下载文件的时候，文件数据被分成了大小相等的piece（除了最后一个piece很有可能比别的要小）。我们和别的peer沟通的主要目的就是从它们那儿把所有需要的pieces收集起来组成我们想要下载的文件。每个piece的大小由.torrent文件info字典表里的piece length的值指定。虽说piece是Torrent的最基本组成单位，但在向peer请求数据的时候所用的却不是piece。事实证明由piece作为数据请求的单位还是有点太大了，不利于高效传输，这就是为什么每一个piece又被细分为大小相同的block。Block的大小是固定的，一般为2^14（16384）字节（除了最后一个block）。一个BitTorrent request信息的构成如下：
```
<len=0013><id=6><index><begin><length>
```
它的payload由index，begin以及length构成。结合上面对piece还有block解释，不难理解index是从零开始一个piece的所在位置；begin（也可说是offset），指的是一个block在piece里的起始位置；length是block的实际大小。

假设我们需要下载一个大小为135168字节的文件，且piece的长度为49152字节，所需要发送的request信息如下：
```
piece 0:
    request block 0: <index=0><begin=0><length=16384>
    request block 1: <index=0><begin=16384><length=16384>
    request block 2: <index=0><begin=32768><length=16384>

piece 1:
    request block 0: <index=1><begin=0><length=16384>
    request block 1: <index=1><begin=16384><length=16384>
    request block 2: <index=1><begin=32768><length=16384>

piece 2:
    request block 0: <index=2><begin=0><length=16384>
    request block 1: <index=2><begin=16384><length=16384>
    request block 2: <index=2><begin=32768><length=4096>
```

在讲.torrent文件解析的时候提到了info字典表里的pieces，它其实就是每个piece的SHA1哈希值拼在一起的结果。想要确认下载到的piece是否正确，可以计算一下它的哈希值并和.torrent文件里提取出来的哈希值作比较。

```cpp
enum BlockStatus
{
    missing = 0,
    pending = 1,
    retrieved = 2
};

struct Block
{
    int piece;
    int offset;
    int length;
    BlockStatus status;
    std::string data;
};

class Piece
{
private:
    const std::string hashValue;
public:
    const int index;
    std::vector<Block*> blocks;

    explicit Piece(int index, std::vector<Block*> blocks, std::string hashValue);
    ~Piece();
    void reset();
    std::string getData();
    Block* nextRequest();
    void blockReceived(int offset, std::string data);
    bool isComplete();
    bool isHashMatching();
};
```

#### PieceManager

要想顺利完成文件的下载，我们必须记录到底哪个peer有哪些pieces，以及已经下载和还需下载的pieces。为了有效地完成管理和记录pieces的任务，我们需要一个`PieceManager`。`PieceManager`需要完成以下几个主要任务：

1. 创建所有的`Piece`对象并把它们都放到待下载的列表里。
2. 和新的peer连接的时候，把peer的ID和bitfield记录在一个map里。
3. 和peer断开连接时，把peer的ID从map里移除。
4. 记录已下载的所有block。收到block的时候检查这个block所在的piece是否已经完成。如果一整个piece里的blocks都已经被下载，计算它的SHA1哈希值，并与正确的值作比较。如果哈希值一致，把整个piece的数据写入硬盘。
5. 找到下一个需要被下载的block。
6. 检查文件下载是否已经完成（确认所有的pieces都已收到）。

这里需要探讨的是获取下一个block的策略。我采用的是[这篇帖子](https://markuseliasson.se/article/bittorrent-in-python/)所提到的算法（其实我的整个`PieceManager`基本上都是照着人家的Python代码写的）。当`nextRequest()`被调用的时候，获取block的策略如下（优先度从高到低）：

1. 如果之前请求的block timeout了，重新请求该block。
2. 请求现在正在下载的piece里的下一个block。
3. 如果没有正在下载的piece，找到最“稀有”的piece（被最少的peer拥有的piece），并请求下载。

C++代码请参考[PieceManager.cpp](https://github.com/ss16118/torrent-client-cpp/blob/main/src/PieceManager.cpp)。

### 多线程下载

如果是单线程处理，每次只和一个peer连接，那下载一个稍微大一点的文件都能等到猴年马月，因此多线程是必须的。参考了SOF上的[这篇帖子](https://stackoverflow.com/questions/15752659/thread-pooling-in-c11)，我实现了一个简单的线程池（Thread pool）。简单来说就是把所有发现的peer放到一个thread-safe的queue里，每个线程都从这个queue里获取peer，并且持续运行直到文件下载结束。以下提供一部分代码，细节请参考[PeerConnection.cpp](https://github.com/ss16118/torrent-client-cpp/blob/main/src/PeerConnection.cpp)以及[TorrentClient.cpp](https://github.com/ss16118/torrent-client-cpp/blob/main/src/TorrentClient.cpp)。在实现多线程的时候还是要小心race condition，我当时因为忘了在一个函数里加lock导致segfault，花了不少时间才找到原因。


```cpp

SharedQueue<Peer*> queue;
std::vector<std::thread> threadPool;

// Adds threads to the thread pool
for (int i = 0; i < threadNum; i++)
{
    PeerConnection connection(&queue, peerId, infoHash, &pieceManager);
    connections.push_back(&connection);
    std::thread thread(&PeerConnection::start, connection);
    threadPool.push_back(std::move(thread));
}

auto lastPeerQuery = (time_t) (-1);

while (true)
{
    if (pieceManager.isComplete())
        break;

    time_t currentTime = std::time(nullptr);
    auto diff = std::difftime(currentTime, lastPeerQuery);
    // Retrieve peers from the tracker after a certain time interval or whenever
    // the queue is empty
    if (lastPeerQuery == -1 || diff >= PEER_QUERY_INTERVAL || queue.empty())
    {
        PeerRetriever peerRetriever(peerId, announceUrl, infoHash, PORT, fileSize);
        std::vector<Peer*> peers = peerRetriever.retrievePeers(pieceManager.bytesDownloaded());
        lastPeerQuery = currentTime;
        if (!peers.empty())
        {
            queue.clear();
            for (auto peer : peers)
                queue.push_back(peer);

        }
    }
}
```

### 总结

完成了以上所有步骤之后，基本上就能成功实现一个最基础的BitTorrent客户端了。我试了一下速度，如果网络连接良好，用八个线程下载，大概半个小时能载完我放在res文件夹里的一个多G的ubuntu iso。速度虽然不是很快，但是看到自己的程序跑起来的时候心中还是激动万分，原来这就是重复造轮子带来的快乐。因为只是实现最基本的下载，所以很多其他BitTorrent客户端该有的功能都不支持，比如说暂停下载、下载包含多个文件的Torrent以及做种。当然，如果用pipelining发送请求的话，下载的速度也能得到进一提高。这是我第一次用C++完成项目，很多convention都不太了解，代码写得也是很脏乱（而且估计还有点小bug），在这里献丑了。总之能完善的地方数不胜数。如果感兴趣，欢迎大家在我的代码上进行添加和修改，也希望这篇文章能对你有所帮助。


### 参考
- [A BitTorrent client in Python 3.5](https://markuseliasson.se/article/bittorrent-in-python/)
- [Building a BitTorrent client from the ground up in Go](https://blog.jse.li/posts/torrent/)
- [BitTorrent Specification](https://wiki.theory.org/BitTorrentSpecification)
- [BitTorrent Wikipedia](https://en.wikipedia.org/wiki/BitTorrent)