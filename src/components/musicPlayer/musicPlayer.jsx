import React, { Component } from "react";
import {
  Segment,
  Grid,
  Button,
  Header,
  Dimmer,
  Icon,
  Progress,
} from "semantic-ui-react";
import ReactDOM from "react-dom";
import playlist from "../../data/music-data.json";
import Slider from "@material-ui/core/Slider";
import "./music-player.css";

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSong: 0,
      isPlaying: false,
      progress: 0.0,
      volume: 0.6,
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
    const nextSong =
      this.state.currentSong === 0
        ? playlist.length - 1
        : this.state.currentSong - 1;
    this.setState({ currentSong: nextSong }, () => {
      if (temp !== this.state.currentSong) {
        this.setState({ isPlaying: true });
      }
    });
  }

  playNextSong() {
    const temp = this.state.currentSong;
    const nextSong =
      this.state.currentSong === playlist.length - 1
        ? 0
        : this.state.currentSong + 1;
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

  handleVolumeChange(value) {}

  componentDidMount() {
    this.setState({ isPlaying: true });
    this.refs.player.volume = this.state.volume;
    this.refs.player.play();
  }

  toggleMute() {
    if (this.state.volume !== 0.0) {
      this.savedVolume = this.state.volume;
      this.setState({ volume: 0.0 });
    } else {
      this.setState({ volume: this.savedVolume });
    }
  }

  render() {
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
        <audio ref="player" onEnded={this.playNextSong.bind(this)}>
          <source src={playlist[this.state.currentSong].path} />
        </audio>
        <Segment color="blue" style={{ fontFamily: "JetBrains Mono" }}>
          <Segment raised>
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
                <Grid.Column width={4}>
                  <Grid>
                    <Grid.Row columns="equal" centered>
                      <Grid.Column textAlign="center">
                        <Button
                          className="music-player-button"
                          icon="angle double left"
                          onClick={this.playPreviousSong.bind(this)}
                        />
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <Button
                          ref="playButton"
                          className="music-player-button"
                          icon={this.state.isPlaying ? "pause" : "play"}
                          onClick={this.togglePlay.bind(this)}
                        />
                      </Grid.Column>
                      <Grid.Column textAlign="center">
                        <Button
                          className="music-player-button"
                          icon="angle double right"
                          onClick={this.playNextSong.bind(this)}
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
                          icon={
                            this.state.volume === 0.0
                              ? "volume off"
                              : "volume down"
                          }
                          size="normal"
                          onClick={this.toggleMute.bind(this)}
                        />
                      </Grid.Column>
                      <Grid.Column width={9} textAlign="center">
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
          <Segment>
            <Header
              as="h4"
              style={{ fontFamily: "JetBrains Mono", marginLeft: "0.5em" }}
            >
              Playlist
            </Header>
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
                    style={{ width: "100%", padding: "0.5em 0.5em 0.5em 1em" }}
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
          </Segment>
        </Segment>
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
  min = min >= 10 ? min : "0" + min;
  sec = Math.floor(sec % 60);
  sec = sec >= 10 ? sec : "0" + sec;
  return min + ":" + sec;
};

export default MusicPlayer;
