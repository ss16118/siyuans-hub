import React, { Component } from "react";
import { globalContext } from "../components/siteContext";
import PostSection from "../components/postSection";
import { Container, Segment, Item } from "semantic-ui-react";
import postData from "../data/post-data.json";

class Blog extends Component {
  state = {};
  pageTitle = { en: "Blog", cn: "博客" };
  render() {
    const posts = postData; //.slice(0, 1);
    const lang = this.context.lang.get;
    const font = lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <div>
        <h1 style={{ fontFamily: font }}>{this.pageTitle[lang]}</h1>
        <Segment>
          <Container>
            <Item.Group divided>
              {posts.map((post) => {
                return (
                  <PostSection
                    key={post.title[lang]}
                    style={{ fontFamily: font }}
                    id={post.id}
                    title={post.title[lang]}
                    date={post.date}
                    tags={post.tags[lang]}
                    imagePath={post.image}
                    font={font}
                  />
                );
              })}
            </Item.Group>
          </Container>
        </Segment>
      </div>
    );
  }
}
Blog.contextType = globalContext;
export default Blog;
