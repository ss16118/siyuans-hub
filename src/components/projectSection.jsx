import React, { Component } from "react";
import { Card, Button, Icon } from "semantic-ui-react";

class ProjectSection extends Component {
  buttonText = {
    en: ["View Source Code", "View Document"],
    cn: ["查看源代码", "查看文件"],
  };
  buttonIcon = ["github", "file"];
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      lang: props.lang,
      description: props.description,
      link: props.link,
    };
  }
  render() {
    const isDocument = !this.state.link.startsWith("https");
    const buttonText = this.buttonText[this.state.lang][isDocument | 0];
    const buttonIcon = this.buttonIcon[isDocument | 0];
    const font = this.state.lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <Card style={{ fontFamily: font }}>
        <Card.Content>
          <Card.Header style={{ fontFamily: font }}>
            {this.state.title}
          </Card.Header>
          <Card.Description>{this.state.description}</Card.Description>
        </Card.Content>
        <Card.Content extra align="right">
          <Button
            color="linkedin"
            href={this.state.link}
            style={{ fontFamily: font }}
          >
            <Icon name={buttonIcon} />
            {buttonText}
          </Button>
        </Card.Content>
      </Card>
    );
  }
}

export default ProjectSection;
