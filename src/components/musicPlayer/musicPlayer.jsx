import React, { Component } from "react";
import {
  Segment,
  Grid,
  Button,
  Header,
  Dimmer,
  Icon,
  Progress,
  Popup,
  Accordion,
  Menu,
} from "semantic-ui-react";
import { globalContext } from "../siteContext";
import ReactDOM from "react-dom";
import playlist from "../../data/music-data.json";
import Slider from "@material-ui/core/Slider";
import labels from "../../data/labels.json";
import "./music-player.css";
import MediaQuery from "react-responsive";

class MusicPlayer extends Component {
  defaultVolume = 0.6;
  constructor(props) {
    super(props);
    this.state = {
      currentSong: 0,
      isPlaying: false,
      progress: 0.0,
      volume: 0.0,
      activeIndex: 0,
      showPlayer: 0,
    };
    this.registeredEvents = false;
    this.currentlyPlaying = 0;
    this.currentVolume = this.state.volume;
    this.savedVolume = 0;
  }
  togglePlay() {
    const player = this.refs.player;
    if (!this.state.isPlaying) {
      player.play();
      this.setState({ isPlaying: true });
    } else {
      player.pause();
      this.setState({ isPlaying: false });
    }
  }

  playPreviousSong() {
    const temp = this.state.currentSong;
    const nextSong = this.getPrevSong();
    this.setState({ currentSong: nextSong }, () => {
      if (temp !== this.state.currentSong) {
        this.setState({ isPlaying: true });
      }
    });
  }

  playNextSong() {
    const temp = this.state.currentSong;
    const nextSong = this.getNextSong();
    this.setState({ currentSong: nextSong }, () => {
      if (temp !== this.state.currentSong) {
        this.setState({ isPlaying: true });
      }
    });
  }

  setProgress(evt) {
    const progressBar = ReactDOM.findDOMNode(this.refs.songProgress);
    const percentage =
      (evt.clientX - progressBar.getBoundingClientRect().left) /
      progressBar.clientWidth;
    this.setState({ progress: percentage });
    const player = this.refs.player;
    player.currentTime = player.duration * percentage;
  }

  selectSong(index) {
    this.setState({ currentSong: index });
    this.setState({ isPlaying: true });
  }

  componentDidMount() {
    const menu = document.getElementById("playlist");
    if (menu) {
      const player = document.getElementById("mobile-music-player");
      menu.style.bottom = player.clientHeight + "px";
      menu.style.display = "none";
    }

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      const volumeButton = document.getElementById("volume-button");
      volumeSlider.style.bottom = 14 + volumeButton.clientHeight * 0.9 + "px";
      volumeSlider.style.left =
        volumeButton.getBoundingClientRect().left +
        volumeButton.clientWidth / 2 +
        "px";
      volumeSlider.style.display = "none";
    }
    this.setState({ volume: this.defaultVolume });
    this.refs.player.volume = this.state.volume;
    try {
      this.refs.player.muted = false;
      // this.refs.player.play();
      // this.setState({ isPlaying: true });
    } catch (err) {
      console.log(err);
    }
  }

  handlePlaylistClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  handleMusicPlayerAccordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const { showPlayer } = this.state;
    const newIndex = showPlayer === index ? -1 : index;

    this.setState({ showPlayer: newIndex });
  };

  toggleMute() {
    if (this.state.volume !== 0.0) {
      this.savedVolume = this.state.volume;
      this.setState({ volume: 0.0 });
    } else {
      this.setState({ volume: this.savedVolume });
    }
  }

  getNextSong = () =>
    this.state.currentSong === playlist.length - 1
      ? 0
      : this.state.currentSong + 1;

  getPrevSong = () =>
    this.state.currentSong === 0
      ? playlist.length - 1
      : this.state.currentSong - 1;

  render() {
    const { activeIndex } = this.state;
    const { showPlayer } = this.state;
    const font =
      this.context.lang.get === "en" ? "JetBrains Mono" : "Noto Sans";

    const player = this.refs.player;
    if (player) {
      if (this.currentlyPlaying !== this.state.currentSong) {
        this.currentlyPlaying = this.state.currentSong;
        player.src = playlist[this.state.currentSong].path;
        player.play();
      }
      if (this.currentVolume !== this.state.volume) {
        this.currentVolume = this.state.volume;
        player.volume = this.currentVolume;
      }
      if (!this.registeredEvents) {
        this.registeredEvents = true;
        player.addEventListener("timeupdate", (evt) => {
          this.setState({ progress: player.currentTime / player.duration });
        });
      }
    }

    return (
      <React.Fragment>
        <audio ref="player" onEnded={this.playNextSong.bind(this)} muted>
          <source src={playlist[this.state.currentSong].path} />
        </audio>
        {/* Mobile device view */}
        <MediaQuery maxDeviceWidth={1224}>
          <Menu
            id="playlist"
            vertical
            borderless
            size="small"
            style={{
              margin: 0,
              width: "auto",
              fontFamily: font,
              position: "fixed",
            }}
          >
            {playlist.map((song, index) => {
              const isSelected = index === this.state.currentSong;
              return (
                <div
                  key={song.title + isSelected}
                  onClick={this.selectSong.bind(this, index)}
                  style={{
                    fontSize: "11px",
                    width: "100%",
                    padding: "0.2em 1em",
                  }}
                >
                  <SongSelectionItem
                    index={index}
                    artist={song.artist}
                    title={song.title}
                    selected={isSelected}
                  />
                </div>
              );
            })}
          </Menu>
          <Slider
            id="volume-slider"
            className="custom-slider"
            orientation="vertical"
            value={this.state.volume * 100}
            aria-labelledby="discrete-slider-small-steps"
            step={20}
            marks
            min={0}
            max={100}
            style={{
              marginTop: "0.2em",
              position: "fixed",
              padding: 0,
              height: "40px",
              zIndex: "100",
            }}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              console.log("Volume: " + this.state.volume);
              this.setState({ volume: val / 100 });
            }}
          />
          <Segment
            id="mobile-music-player"
            style={{
              width: "100%",
              position: "fixed",
              bottom: "0px",
            }}
          >
            <Grid>
              <Grid.Row centered style={{ padding: "1em 0 0 0" }}>
                <Header
                  as="h4"
                  style={{ fontFamily: "JetBrains Mono", fontSize: "12px" }}
                >
                  {playlist[this.state.currentSong].artist} -{" "}
                  {playlist[this.state.currentSong].title}
                </Header>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={5}>
                  <Button.Group icon>
                    <Button
                      id="playlist-button"
                      className="mobile-button"
                      icon="list"
                      size="mini"
                      onClick={() => {
                        const menu = document.getElementById("playlist");
                        menu.style.display =
                          menu.style.display === "none" ? "flex" : "none";
                      }}
                    />
                    <Button
                      className="mobile-button"
                      icon="angle double left"
                      size="mini"
                      onClick={this.playPreviousSong.bind(this)}
                    />
                    <Button
                      ref="playButton"
                      size="mini"
                      className="mobile-button"
                      icon={this.state.isPlaying ? "pause" : "play"}
                      onClick={this.togglePlay.bind(this)}
                    />
                    <Button
                      className="mobile-button"
                      icon="angle double right"
                      size="mini"
                      onClick={this.playNextSong.bind(this)}
                    />
                  </Button.Group>
                </Grid.Column>
                <Grid.Column width={9} textAlign="center">
                  <Grid
                    style={{
                      position: "relative",
                      top: "15%",
                      marginLeft: "0.2em",
                    }}
                  >
                    <Grid.Row
                      columns="equal"
                      style={{ paddingBottom: 0, fontSize: "12px" }}
                    >
                      <Grid.Column
                        textAlign="center"
                        style={{ fontSize: "11px" }}
                      >
                        {this.refs.player &&
                          readableDuration(this.refs.player.currentTime)}
                      </Grid.Column>
                      <Grid.Column
                        width={9}
                        textAlign="center"
                        style={{ marginTop: "0.2em" }}
                      >
                        <Progress
                          ref="songProgress"
                          active
                          color="blue"
                          size="small"
                          style={{ margin: 0 }}
                          percent={this.state.progress * 100}
                          onClick={this.setProgress.bind(this)}
                        />
                      </Grid.Column>
                      <Grid.Column
                        textAlign="center"
                        style={{ fontSize: "11px" }}
                      >
                        <span>
                          {this.refs.player &&
                            readableDuration(this.refs.player.duration)}
                        </span>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Grid.Column>
                <Grid.Column
                  width={2}
                  textAlign="center"
                  style={{ paddingLeft: "0.5em" }}
                >
                  <Button
                    id="volume-button"
                    className="mobile-button"
                    icon={
                      this.state.volume === 0.0 ? "volume off" : "volume down"
                    }
                    onClick={() => {
                      const slider = document.getElementById("volume-slider");
                      slider.style.display =
                        slider.style.display === "none" ? "flex" : "none";
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </MediaQuery>

        {/* Desktop or laptop view */}
        <MediaQuery minDeviceWidth={1224}>
          <Accordion
            styled
            style={{
              fontFamily: "JetBrains Mono",
              marginTop: "1em",
            }}
          >
            <Accordion.Title
              active={showPlayer === 0}
              index={0}
              as="h3"
              style={{ fontFamily: font }}
              onClick={this.handleMusicPlayerAccordionClick}
            >
              <Icon name="dropdown" />
              {labels[this.context.lang.get]["music"]["title"]}
            </Accordion.Title>

            <Accordion.Content
              active={showPlayer === 0}
              style={{ paddingTop: 0 }}
            >
              <Segment raised color="blue">
                <Grid>
                  {/* Title of the song */}
                  <Grid.Row centered>
                    <Header as="h4" style={{ fontFamily: "JetBrains Mono" }}>
                      {playlist[this.state.currentSong].title}
                    </Header>
                  </Grid.Row>
                  <Grid.Row centered style={{ padding: 0, margin: 0 }}>
                    <Header as="h6" style={{ fontFamily: "JetBrains Mono" }}>
                      {playlist[this.state.currentSong].artist}
                    </Header>
                  </Grid.Row>
                  {/* Progress bar */}
                  <Grid.Row
                    columns="equal"
                    style={{ paddingBottom: 0, fontSize: "12px" }}
                  >
                    <Grid.Column textAlign="center">
                      {this.refs.player &&
                        readableDuration(this.refs.player.currentTime)}
                    </Grid.Column>
                    <Grid.Column width={9} textAlign="center">
                      <Progress
                        ref="songProgress"
                        active
                        color="blue"
                        size="small"
                        style={{ margin: 0 }}
                        percent={this.state.progress * 100}
                        onClick={this.setProgress.bind(this)}
                      />
                    </Grid.Column>
                    <Grid.Column textAlign="center">
                      <span>
                        {this.refs.player &&
                          readableDuration(this.refs.player.duration)}
                      </span>
                    </Grid.Column>
                  </Grid.Row>
                  {/* Controls */}
                  <Grid.Row centered style={{ paddingLeft: "32%" }}>
                    <Grid.Column width={5}>
                      <Grid>
                        <Grid.Row columns="equal" centered>
                          <Grid.Column textAlign="center">
                            <Popup
                              content={playlist[this.getPrevSong()].title}
                              position="bottom center"
                              trigger={
                                <Button
                                  className="music-player-button"
                                  icon="angle double left"
                                  size="small"
                                  onClick={this.playPreviousSong.bind(this)}
                                />
                              }
                            />
                          </Grid.Column>
                          <Grid.Column textAlign="center">
                            <Button
                              ref="playButton"
                              className="music-player-button"
                              size="small"
                              icon={this.state.isPlaying ? "pause" : "play"}
                              onClick={this.togglePlay.bind(this)}
                            />
                          </Grid.Column>
                          <Grid.Column textAlign="center">
                            <Popup
                              content={playlist[this.getNextSong()].title}
                              position="bottom center"
                              trigger={
                                <Button
                                  className="music-player-button"
                                  icon="angle double right"
                                  size="small"
                                  onClick={this.playNextSong.bind(this)}
                                />
                              }
                            />
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Grid.Column>
                    <Grid.Column width={8} style={{ paddingLeft: "2em" }}>
                      <Grid>
                        <Grid.Row columns="equal" centered>
                          <Grid.Column textAlign="center" width={5}>
                            <Button
                              className="music-player-button"
                              size="small"
                              icon={
                                this.state.volume === 0.0
                                  ? "volume off"
                                  : "volume down"
                              }
                              onClick={this.toggleMute.bind(this)}
                            />
                          </Grid.Column>
                          <Grid.Column width={8} textAlign="center">
                            <Slider
                              className="custom-slider"
                              value={this.state.volume * 100}
                              aria-labelledby="discrete-slider-small-steps"
                              step={20}
                              marks
                              min={0}
                              max={100}
                              style={{ marginTop: "0.2em" }}
                              valueLabelDisplay="auto"
                              onChange={(e, val) =>
                                this.setState({ volume: val / 100 })
                              }
                            />
                          </Grid.Column>
                        </Grid.Row>
                      </Grid>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>

              {/* Playlist */}
              <Accordion styled>
                <Accordion.Title
                  active={activeIndex === 0}
                  index={0}
                  as="h3"
                  onClick={this.handlePlaylistClick}
                  style={{ fontFamily: font, marginLeft: "0.5em" }}
                >
                  <Icon name="dropdown" />
                  {labels[this.context.lang.get]["music"]["playlist"]}
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 0}>
                  <Grid
                    divided
                    style={{ fontFamily: "JetBrains Mono", fontSize: "11px" }}
                  >
                    {playlist.map((song, index) => {
                      const isSelected = index === this.state.currentSong;
                      return (
                        <div
                          key={song.title + isSelected}
                          onClick={this.selectSong.bind(this, index)}
                          style={{
                            width: "100%",
                            padding: "0.5em 0.5em 0.5em 1em",
                          }}
                        >
                          <SongSelectionItem
                            index={index}
                            artist={song.artist}
                            title={song.title}
                            selected={isSelected}
                          />
                        </div>
                      );
                    })}
                  </Grid>
                </Accordion.Content>
              </Accordion>
            </Accordion.Content>
          </Accordion>
        </MediaQuery>
      </React.Fragment>
    );
  }
}

class SongSelectionItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: props.index,
      artist: props.artist,
      title: props.title,
      selected: props.selected,
    };
  }
  handleMouseEnter = () => this.setState({ active: true });
  handleMouseLeave = () => this.setState({ active: false });
  render() {
    const { active } = this.state;
    return (
      <Dimmer.Dimmable
        as={Grid.Row}
        dimmed={active}
        className="song-selection"
        style={{ padding: "5px 10px 5px 0.5em", borderRadius: "5px" }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <span>
          {this.state.selected && <Icon name="play" />} {this.state.index + 1}.{" "}
          {this.state.artist} - {this.state.title}
        </span>
        <Dimmer active={active}>
          <Icon name="play" />
          <span> {this.state.title}</span>
        </Dimmer>
      </Dimmer.Dimmable>
    );
  }
}

let readableDuration = function (seconds) {
  let sec = Math.floor(seconds);
  let min = Math.floor(sec / 60);
  min = min >= 10 ? min : "0" + (isNaN(min) ? 0 : min);
  sec = Math.floor(sec % 60);
  sec = sec >= 10 ? sec : "0" + (isNaN(sec) ? 0 : sec);
  return min + ":" + sec;
};

MusicPlayer.contextType = globalContext;
export default MusicPlayer;
