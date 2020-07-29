<h1 align="center"> 从零开始为你的自制编程语言写一个专属VS Code插件 </h1>

大二的第二个学期，系里留的大作业是写一个 WACC 的编译器。WACC 是我们学校用来教编译器基础的自制语言，只要知道是它是一门相当简单的指令式编程语言就行了，在这里就不过多介绍了。这项大作业的最后一部分是让我们每个小组自由创作，可以给 WACC 添加各种元素。当时我负责的是编译器的优化还有 WACC 的 VS Code 插件。项目结束的时候插件也写完了，现在只要搜索 WACC 就可以在[Marketplace](https://marketplace.visualstudio.com/items?itemName=YiningShen.wacc-language-support)里找到。虽然不是什么特别厉害的工程，而且除了我们系里的学生根本不会有人下载，但还是觉得挺自豪的，毕竟现在全世界的程序员都能在 VS Code 里找到我写的插件了。在这里准备从头开始简单描述一下到底怎么给自制编程语言写 VS Code 插件，希望能为有类似想法的朋友提供一点帮助。

<h3>主要内容</h3>

- [准备工作](#准备工作)
- [语法高亮](#语法高亮)
- [语义查错](#语义查错)
- [代码生成](#代码生成)
- [发布](#发布)
- [总结](#总结)
- [参考](#参考)

### 准备工作

开始之前要先确保你已经装好了[Node.js](https://nodejs.org/)还有 Git。准备就绪后在 command prompt 或是 terminal 里输入

```
> npm install -g yo generator-code
```

安装完成后再输入。

```
> yo code
```

然后你会看到以下提示。因为我们的目标是给自制语言写插件，所以当然选`New Language Support`。

<p align="center">
  <img class="responsive" src="/siyuans-hub/contents/posts/vscode-extension-for-custom-language/start-extension.png" alt="创建新插件" />
</p>

之后的选项如下：

```
# Enter the URL (http, https) or the file path of the tmLanguage grammar or
press ENTER to start with a new grammar.
? URL or file to import, or none for new: (如果有自制语言的语法文件就输入URL)

? What's the name of your extension? example-language-support （输入插件名）

? What's the identifier of your extension? example (一般输入语言的名字)

? What's the description of your extension? An example description (对于语言的描述)

# Enter the id of the language. The id is an identifier and is single,
lower-case name such as 'php', 'javascript'
? Language id: example

# Enter the name of the language. The name will be shown in the VS Code editor
mode selector.
? Language name: example

# Enter the file extensions of the language. Use commas to separate
multiple entries (e.g. .ruby, .rb)
? File extensions: .eg （输入语言文件的后缀）

# Enter the root scope name of the grammar (e.g. source.ruby)
? Scope names: source.example（请根据自己的情况填，一般来说是 “source.(语言名)” ）
```

填写完这些以后就可以用 VS Code 打开新创建的文件夹了。准备工作也到此结束，接下来要做的是添加语法高亮。

### 语法高亮

VS Code 的标记语法（Tokenization Grammar）是由 TextMate 语法支持的，详细介绍可以在[官网的文档](https://macromates.com/manual/en/language_grammars)里找到。很重要的一点是要想写一个完整的语法文件，必须得熟悉正则表达式。如果没学过正则表达式或者对正则表达式的运用不是很熟练建议还是先多加练习。

那么首先要做的是打开在 syntaxes 文件夹里的 tmLanguage.json 文件，主要内容如以下所示。

<p align="center">
  <img class="responsive" src="/siyuans-hub/contents/posts/vscode-extension-for-custom-language/tmLanguage-file.png" style="height: 400px"alt="语法文件" />
</p>

这里简单讲解一下几个重要的关键词：

- `patterns`: 由语法分析规则（parse rules）所组成的数组。上面图片里的语法分析规则指的是`keywords`还有`strings`两项。举个例子，如果你想让所有变量被高亮的话，那就应该再添加一条叫`variables`的规则。
- `name`: 指的是与规则相匹配的代码的种类。主要是用来表示这个规则底下的代码到底是什么颜色的，比如上面例子里如果一串代码满足`strings`规则，那么在 VS Code 里它就会被标记成当前主题下 strings 的颜色。这里的 name 是不能随便填的，具体有哪些选项请参考[这个网页](https://www.sublimetext.com/docs/3/scope_naming.html#keyword)。
- `match`: 正则表达式，用来指示标记引擎哪些代码改被归为一类。上面的例子里如果一串代码满足`"\\b(if|while|for|return)\\b"`，就会被归纳为`keyword.control`。
- `include`: 用来引用别的语言或是递归式地引用自己本身的语法。假设我们想要给所有的数据类型标记高亮，那么就可以用以下 pattern 来表示。这里的`array-type`，`pair-type`还有`base-type`所指的就是同一个文件中其他的规则。

  ```json
    "types": {
      "patterns": [
        {
          "include": "#array-type"
        },
        {
          "include": "#pair-type"
        },
        {
          "include": "#base-types"
        }
      ]
    },
  ```

- `begin`, `end`：这两个关键词都是正则表达式，和`match`不能同时使用。`begin`用来标记一个多行字符串的开头应该满足的条件，`end`则用来标记结尾满足的条件。

原文档里有关 TextMate 语法的内容还是挺多的，这里介绍的不是很全面。想要尽快熟悉怎么写好这个文件可以参考别的主流语言 VS Code 插件的写法，比如[JavaScript](https://github.com/microsoft/vscode/blob/master/extensions/javascript/syntaxes/JavaScript.tmLanguage.json)。

运行你自己的 VS Code 插件只要按一下 F5 就行了。之后打开一个包含你的自制语言源代码的文件，应该就能看到高亮了。

### 语义查错

别的 IDE 或是语言插件一般都自带语义查错的功能。比如如果你给一个变量的赋值并不符合它的数据类型，这个变量就会被标红，并且会显示错误类型。在自己的 VS Code 插件里如果想实现这个功能还是需要费点力气的，因为需要用到 [Language Server](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)。

首先需要在 command prompt 或是 terminal 里输入以下内容。我们会以 VS Code 提供的例子为基础进行修改。

```
> git clone https://github.com/microsoft/vscode-extension-samples.git
> cd vscode-extension-samples/lsp-sample
> npm install
> npm run compile
> code .
```

接下来打开 server/src 文件夹底下的 server.ts。里面的内容稍微有点多，一开始读起来可能会有点复杂，其实我也不是很清楚里面有些代码是干什么的，这儿就简单介绍一下和语义查错有关的部分。先看一眼`validateTextDocument`这个函数，例子里的查错是在这里进行的。简单来说如果需要让 Language Server 检测并发送语义上的错误只需要往`diagnostics`这个数组里添加`Diagnostic`就行了。`Diagnostic`是由`severity`，`range`还有`message`这些必要的 key-value pair 组成的。`severity`用来标示严重程度，一个`Diagnostic`可以是 error，也可以只是 warning。`location`用来指示文档哪个部分会被标记，`start`和`end`分别是起始字符和结束字符在文档中的位置。

老实讲如果想用把所有的语义查错都写进 server 里是很困难的。我尝试过检测一个变量名是否有被重复使用，但很快就发现要想正确定义代码的 scope 以及其他的要素好像必须得用 TypeScript 在这个插件里手写半个编译器。最后我选择的解决办法是把我们作业里已经接近完成的编译器变成一个可执行文件，放进插件里，再由这个已经写完的编译器去检测代码的语法。如果有语义错误就告诉 Language Server 错误的类型以及位置。这两者之间具体怎么沟通你可以自己选择。我当时是让编译器以字符串的形式输出语义检测的结果，然后再用 TypeScript 去分析（parse）输出的字符串。我知道这么做挺没效率的，但确实是我能想到的唯一能找到所有语义错误的方法。如果你有更好的解法欢迎私信告诉我。

完成语义查错后我是把整个 lsp-example 文件夹里大部分的文件拷贝到了之前创建的插件的文件夹里。感觉有点傻，但是挺直截了当的。需要注意的是得改一下有些配置文件里的插件名还有其他相关的信息。

### 代码生成

自动代码生成在 VS Code 里可以用 Code Snippets 来实现。首先要在插件的根目录下创建一个 snippets 文件夹，然后在里面添加一个后缀为.code-snippets 的 json 文件。记得在 package.json 里添加以下内容：

```json
"snippets": [
  {
    "language": "example", //（你的自制语言的ID）
    "path": "snippets/example.code-snippets" //（刚才添加的json文件的路径）
  }
],
```

Code Snippet 文件的具体写法可以参照 VS Code 的[官网](https://code.visualstudio.com/docs/editor/userdefinedsnippets)。个人觉的还是挺好理解的，所以就不多做讲解了。具体用法也很简单，只要在输入代码的时候看到提示按一下 Tab 键就可以了。这里介绍一个在 YouTube 上看到的[讲解视频](https://www.youtube.com/watch?v=JIqk9UxgKEc)里推荐的自动生成 snippet 的[网站](https://snippet-generator.app/)，有兴趣的可以看一眼。

### 发布

如果你已经完成了前面所有的部分那你的自制语言插件就基本上可以发布了（其实光有语法高亮就行）。
输入`npm install -g vsce`安装 vsce。假如没有 Azure DevOps 的账号就先去注册一个，然后再根据[官网](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)上的指导获取 Personal Access Token。步骤很简单明了，不多做解释。还有就是最好在发布前把 Change Log 还有 README 都写好，养成好习惯。

### 总结

这里只是简单列举了一下创作 VS Code 插件的步骤而已，很多细节并没有详细讲解，而且有不少可以添加的功能我自己也不是很清楚。毕竟这篇文章只是作为入门的参考而已，不足的地方欢迎大家指出。

### 参考

- [VS Code: Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
- [Synatx Highlighting Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [VS Code: Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [VS Code: Code Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
- [VS Code: Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Code Faster With Custom VS Code Snippets](https://www.youtube.com/watch?v=JIqk9UxgKEc)
