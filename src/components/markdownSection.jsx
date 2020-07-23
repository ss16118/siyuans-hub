import React, { Component } from "react";
import ReactMarkdown from "react-markdown/with-html";
import { Container } from "semantic-ui-react";

class MarkdownSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: props.lang,
      markdownText: null,
      filePath: props.filePath,
    };
  }

  async loadMarkdown() {
    await fetch(this.state.filePath)
      .then((response) => response.text())
      .then((text) => this.setState({ markdownText: text }));
  }

  UNSAFE_componentWillMount() {
    this.loadMarkdown();
  }
  render() {
    const font = this.state.lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <div style={{ fontFamily: font }}>
        <Container textAlign="justified">
          <ReactMarkdown escapeHtml={false} source={this.state.markdownText} />
        </Container>
      </div>
    );
  }
}
export default MarkdownSection;
