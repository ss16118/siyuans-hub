import React, { Component } from "react";
import "./App.css";
import NavigationMenu from "./components/sidebar";
import Blog from "./pages/blog";
import Projects from "./pages/projects";
import Home from "./pages/home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Grid, Segment } from "semantic-ui-react";
import { globalContext } from "./components/siteContext";
import MarkdownSection from "./components/markdownSection";
import postData from "./data/post-data.json";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";

class App extends Component {
  state = {};
  render() {
    /* Easter Egg */
    figlet.parseFont("Standard", standard);
    figlet.text(
      "Welcome to\nSiyuan's Hub",
      {
        font: "Standard",
      },
      function (_, data) {
        console.log(data);
      }
    );

    const lang = this.context.lang.get;

    return (
      <Router>
        <React.Fragment>
          <Grid
            style={{
              height: "100vh",
              width: "100%",
              position: "fixed",
              marginTop: "0em",
            }}
          >
            <NavigationMenu />
            <Grid.Column stretched width={10} style={{ height: "100%" }}>
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
          </Grid>
        </React.Fragment>
      </Router>
    );
  }
}
App.contextType = globalContext;
export default App;
