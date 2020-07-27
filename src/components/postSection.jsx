import React, { Component } from "react";
import { globalContext } from "./siteContext";
import { Image, Label, Item } from "semantic-ui-react";
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
      font: props.font,
      imagePath: props.imagePath,
    };
  }

  render() {
    const { font } = this.state;
    return (
      <Item
        as={Link}
        to={`/siyuans-hub/blog/${this.state.id}`}
        style={{ fontFamily: font }}
      >
        <div
          className="image"
          style={{ backgroundImage: `url(${this.state.imagePath})` }}
        ></div>
        <Item.Content>
          <Item.Header
            style={{
              fontSize: "16px",
              marginBottom: "0.3em",
              fontFamily: font,
            }}
            dangerouslySetInnerHTML={{ __html: this.state.title }}
          ></Item.Header>
          <Item.Description style={{ color: "gray", marginBottom: "0.3em" }}>
            <span>{this.state.date}</span>
          </Item.Description>
          <Item.Content>
            {this.state.tags !== undefined &&
              this.state.tags.map((tag) => {
                return <Label key={tag}>{tag}</Label>;
              })}
          </Item.Content>
        </Item.Content>
      </Item>
    );
  }
}

PostSection.contextType = globalContext;
export default PostSection;
