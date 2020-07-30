import React, { Component } from "react";
import { globalContext } from "./siteContext";
import labels from "../data/labels";
import { Image, Menu, Segment, Dropdown, Flag } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Navbar extends Component {
  constructor(props) {
    super(props);
    let itemName = window.location.pathname.substr(13);
    itemName =
      itemName === ""
        ? "Home"
        : itemName.charAt(0).toUpperCase() + itemName.slice(1);
    this.state = { activeItem: itemName };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  handleLanguageSelection(language) {
    if (language !== null) {
      this.context.lang.set(language);
    }
  }

  render() {
    const url = {
      Home: "/siyuans-hub/",
      Blog: "/siyuans-hub/blog",
      Projects: "/siyuans-hub/projects",
    };
    const langMenu = {
      en: "Language",
      cn: "语言",
    };
    const lang = this.context.lang.get;
    const navLabels = labels[lang]["navigation"];
    const { activeItem } = this.state;
    const font = lang === "en" ? "JetBrains Mono" : "Noto Sans";

    return (
      <Segment
        id="navbar"
        style={{
          padding: "0.5em",
          width: "100%",
          borderRadius: 0,
          position: "fixed",
          zIndex: "1000",
        }}
      >
        <Menu
          pointing
          secondary
          position="top"
          style={{ fontFamily: font, fontSize: "11px" }}
        >
          <Menu.Item as={Link} to="/siyuans-hub/" style={{ padding: "0.5em" }}>
            <Image
              src="/siyuans-hub/favicon/favicon-16x16.png"
              style={{ width: "20px", height: "20px" }}
            />
          </Menu.Item>
          {Object.keys(navLabels).map((key) => {
            return (
              <Menu.Item
                key={navLabels[key]}
                id={key}
                name={navLabels[key]}
                as={Link}
                to={url[key]}
                active={activeItem === key}
                onClick={this.handleItemClick}
              />
            );
          })}
          <Dropdown item text={langMenu[lang]} style={{ fontFamily: font }}>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => this.handleLanguageSelection("en")}>
                <Flag name="gb" /> EN
              </Dropdown.Item>
              <Dropdown.Item onClick={() => this.handleLanguageSelection("cn")}>
                <Flag name="cn" /> CN
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu>
      </Segment>
    );
  }
}
Navbar.contextType = globalContext;
export default Navbar;
