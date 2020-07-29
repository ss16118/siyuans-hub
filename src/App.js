import React, { Component, createRef } from "react";
import "./App.css";
import NavigationMenu from "./components/sidebar";
import Blog from "./pages/blog";
import Projects from "./pages/projects";
import Home from "./pages/home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Grid, Segment, Ref, Rail, Sticky } from "semantic-ui-react";
import { globalContext } from "./components/siteContext";
import MarkdownSection from "./components/markdownSection";
import postData from "./data/post-data.json";
import MusicPlayer from "./components/musicPlayer/musicPlayer";

class App extends Component {
  contextRef = createRef();
  render() {
    const lang = this.context.lang.get;

    return (
      <Router>
        <React.Fragment>
          <Ref innerRef={this.contextRef}>
            <Grid
              style={{
                width: "100%",
                marginTop: "0em",
              }}
            >
              <Grid.Column width={3}>
                <Rail internal position="left" style={{ width: "100%" }}>
                  <Sticky context={this.contextRef}>
                    <NavigationMenu />
                  </Sticky>
                </Rail>
              </Grid.Column>
              <Grid.Column stretched width={9} style={{ height: "100%" }}>
                <Segment style={{ padding: "1.5em", overflow: "auto" }}>
                  <Switch>
                    <Route path="/siyuans-hub/" exact component={Home} />
                    <Route path="/siyuans-hub/blog" exact component={Blog} />
                    <Route
                      path="/siyuans-hub/projects"
                      exact
                      component={Projects}
                    />
                    {/* Posts */}
                    {postData.map((post) => {
                      return (
                        <Route
                          key={post.title[lang]}
                          exact
                          path={`/siyuans-hub/blog/${post.id}`}
                        >
                          <MarkdownSection
                            filePath={post.path[lang]}
                            lang={lang}
                          />
                        </Route>
                      );
                    })}
                  </Switch>
                </Segment>
              </Grid.Column>
              {/*
              Music Player
            */}
              <Grid.Column width={4}>
                <Rail internal position="right" style={{ width: "100%" }}>
                  <Sticky context={this.contextRef}>
                    <MusicPlayer />
                  </Sticky>
                </Rail>
              </Grid.Column>
            </Grid>
          </Ref>
        </React.Fragment>
      </Router>
    );
  }
}
App.contextType = globalContext;
export default App;
