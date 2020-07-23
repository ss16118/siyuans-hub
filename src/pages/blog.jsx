import React, { Component } from "react";
import { globalContext } from "../components/siteContext";
import PostSection from "../components/postSection";
import { Card, Container, Segment } from "semantic-ui-react";
import postData from "../data/post-data.json";

class Blog extends Component {
  state = {};
  pageTitle = { en: "Blog", cn: "博客" };
  render() {
    const lang = this.context.lang.get;
    const font = lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <div>
        <h1 style={{ fontFamily: font }}>{this.pageTitle[lang]}</h1>
        {
          <Segment secondary>
            <Container>
              <Card.Group>
                {postData.map((post) => {
                  return (
                    <PostSection
                      key={post.title[lang]}
                      style={{ fontFamily: font }}
                      id={post.id}
                      title={post.title[lang]}
                      date={post.date}
                      tags={post.tags[lang]}
                    />
                  );
                })}
              </Card.Group>
            </Container>
          </Segment>
        }
      </div>
    );
  }
}
Blog.contextType = globalContext;
export default Blog;
