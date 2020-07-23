import React, { Component } from "react";
import { globalContext } from "./siteContext";
import { Card, Label } from "semantic-ui-react";
import { Link } from "react-router-dom";

class PostSection extends Component {
  state = {};
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      title: props.title,
      date: props.date,
      tags: props.tags,
    };
  }

  render() {
    return (
      <Card fluid as={Link} to={`/siyuans-hub/blog/${this.state.id}`}>
        <Card.Content>
          <Card.Header style={{ fontSize: "16px", marginBottom: "0.3em" }}>
            {this.state.title}
          </Card.Header>
          <Card.Description style={{ color: "gray", marginBottom: "0.3em" }}>
            <span>{this.state.date}</span>
          </Card.Description>
          <Card.Content extra>
            {this.state.tags !== undefined &&
              this.state.tags.map((tag) => {
                return <Label key={tag}>{tag}</Label>;
              })}
          </Card.Content>
        </Card.Content>
      </Card>
    );
  }
}

PostSection.contextType = globalContext;
export default PostSection;
