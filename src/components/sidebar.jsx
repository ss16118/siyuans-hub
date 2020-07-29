import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";
import LanguageSelector from "./languageSelector";
import { globalContext } from "./siteContext";
import { Image } from "semantic-ui-react";
import labels from "../data/labels";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    let itemName = window.location.pathname.substr(13);
    itemName =
      itemName === ""
        ? "Home"
        : itemName.charAt(0).toUpperCase() + itemName.slice(1);
    this.state = { activeItem: itemName };
  }

  handleItemClick = (e, { id }) => this.setState({ activeItem: id });

  render() {
    const url = {
      Home: "/siyuans-hub/",
      Blog: "/siyuans-hub/blog",
      Projects: "/siyuans-hub/projects",
    };
    const { activeItem } = this.state;
    const lang = this.context.lang.get;
    const navLabels = labels[lang]["navigation"];
    const font = lang === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <React.Fragment>
        <Link to="/siyuans-hub/">
          <div
            style={{
              marginTop: "2em",
              marginLeft: "2em",
              marginBottom: "1.5em",
              fontFamily: "JetBrains Mono",
              fontSize: "18px",
              color: "black",
            }}
          >
            <Image
              src="/siyuans-hub/favicon/favicon-32x32.png"
              verticalAlign="middle"
              style={{ marginRight: "0.5em" }}
            />
            <span
              onMouseEnter={(e) => {
                e.target.style.color = "gray";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "black";
              }}
            >
              Siyuan's Hub
            </span>
          </div>
        </Link>
        <Menu fluid vertical tabular>
          {Object.keys(navLabels).map((key) => {
            return (
              <Menu.Item
                key={navLabels[key]}
                id={key}
                name={navLabels[key]}
                as={Link}
                to={url[key]}
                style={{ fontFamily: font, paddingLeft: "2em" }}
                active={activeItem === key}
                onClick={this.handleItemClick}
              />
            );
          })}
          <Menu.Item
            attached="bottom"
            style={{ marginTop: "155%", textAlign: "center", border: "none" }}
          >
            <LanguageSelector />
          </Menu.Item>
        </Menu>
      </React.Fragment>
    );
  }
}
NavigationMenu.contextType = globalContext;
export default NavigationMenu;
