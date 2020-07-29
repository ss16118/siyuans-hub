import React, { Component } from "react";
import { globalContext } from "../components/siteContext";
import projectData from "../data/projects-data.json";
import ProjectSection from "../components/projectSection";
import { Card, Segment } from "semantic-ui-react";
import MediaQuery from "react-responsive";

class Projects extends Component {
  state = {};
  pageTitle = { en: "Projects", cn: "项目" };
  render() {
    const lang = this.context.lang.get;
    const font = lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <div>
        <h1 style={{ fontFamily: font }}>{this.pageTitle[lang]}</h1>
        <Segment>
          <MediaQuery maxDeviceWidth={1224}>
            <Card.Group itemsPerRow={1}>
              {projectData.map((project) => {
                return (
                  <ProjectSection
                    key={project.title[lang] + lang}
                    lang={lang}
                    title={project.title[lang]}
                    description={project.description[lang]}
                    link={project.link}
                  />
                );
              })}
            </Card.Group>
          </MediaQuery>
          <MediaQuery minDeviceWidth={1224}>
            <Card.Group itemsPerRow={2}>
              {projectData.map((project) => {
                return (
                  <ProjectSection
                    key={project.title[lang] + lang}
                    lang={lang}
                    title={project.title[lang]}
                    description={project.description[lang]}
                    link={project.link}
                  />
                );
              })}
            </Card.Group>
          </MediaQuery>
        </Segment>
      </div>
    );
  }
}
Projects.contextType = globalContext;
export default Projects;
