import React, { Component } from "react";
import { globalContext } from "./siteContext";
import { Image, Segment, Label, Item } from "semantic-ui-react";
import { Link } from "react-router-dom";
import MediaQuery from "react-responsive";

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

  getItemContainer = (elem) => {
    return elem.nodeName === "A"
      ? elem
      : this.getItemContainer(elem.parentNode);
  };

  render() {
    const { font } = this.state;
    return (
      <Item
        as={Link}
        to={`/siyuans-hub/blog/${this.state.id}`}
        className="post-section"
        style={{ fontFamily: font }}
        onMouseEnter={(e) => {
          const itemContainer = this.getItemContainer(e.target);
          itemContainer.style.boxShadow =
            "0 2px 4px 0 rgba(34,36,38,.12), 0 2px 10px 0 rgba(34,36,38,.15)";
        }}
        onMouseLeave={(e) => {
          const itemContainer = this.getItemContainer(e.target);
          itemContainer.style.boxShadow = "none";
        }}
      >
        <MediaQuery maxDeviceWidth={1224}>
          <Image src={this.state.imagePath} />
        </MediaQuery>
        <MediaQuery minDeviceWidth={1224}>
          <div
            className="image"
            style={{ backgroundImage: `url(${this.state.imagePath})` }}
          ></div>
        </MediaQuery>

        <Segment
          style={{
            margin: 0,
            padding: 0,
            marginLeft: "1em",
            border: "none",
            boxShadow: "none",
          }}
        >
          <Item.Content>
            <Item.Header
              style={{
                fontSize: "14px",
                fontFamily: font,
                marginBottom: "0.3em",
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
        </Segment>
      </Item>
    );
  }
}

PostSection.contextType = globalContext;
export default PostSection;
