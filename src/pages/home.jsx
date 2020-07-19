import React, { Component } from "react";
import { globalContext } from "../components/siteContext";
import MarkdownSection from "../components/markdownSection";

class Home extends Component {
  render() {
    const bioPath =
      "/siyuans-hub/contents/bio-" + this.context.lang.get + ".md";
    const pageContent = (
      <MarkdownSection
        key={bioPath}
        filePath={bioPath}
        lang={this.context.lang.get}
      />
    );
    return pageContent;
  }
}
Home.contextType = globalContext;

export default Home;
