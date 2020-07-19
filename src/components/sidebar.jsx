import React, { Component } from "react";
import { Grid, Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";
import LanguageSelector from "./languageSelector";
import { globalContext } from "./siteContext";
import { Image } from "semantic-ui-react";

class NavigationMenu extends Component {
  tabs = [
    ["Home", "首页", "/siyuans-hub/"],
    ["Blog", "博客", "/siyuans-hub/blog"],
    ["Projects", "项目", "/siyuans-hub/projects"],
  ];

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
    const { activeItem } = this.state;
    const displayIndex = this.context.lang.get === "en" ? 0 : 1;
    const font =
      this.context.lang.get === "en" ? "JetBrains Mono" : "Noto Sans";
    return (
      <Grid.Column width={3}>
        <Link to="/">
          <div
            style={{
              marginTop: "1em",
              marginLeft: "1em",
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
          {this.tabs.map((tab) => {
            return (
              <Menu.Item
                key={tab[0]}
                id={tab[0]}
                name={tab[displayIndex]}
                as={Link}
                to={tab[2]}
                style={{ fontFamily: font }}
                active={activeItem === tab[0]}
                onClick={this.handleItemClick}
              />
            );
          })}
          <Menu.Item
            attached="bottom"
            style={{ marginTop: "185%", textAlign: "center", border: "none" }}
          >
            <LanguageSelector />
          </Menu.Item>
        </Menu>
      </Grid.Column>
    );
  }
}
NavigationMenu.contextType = globalContext;
export default NavigationMenu;
