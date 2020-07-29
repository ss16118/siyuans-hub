import React, { Component } from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { globalContext } from "./siteContext";
import { Flag } from "semantic-ui-react";

class LanguageSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: "en",
    };
  }

  handleLanguageSelection = (e, language) => {
    if (language !== null) {
      this.setState({ language: language });
      this.context.lang.set(language);
    }
  };

  render() {
    return (
      <div>
        <ToggleButtonGroup
          size="small"
          value={this.state.language}
          exclusive
          onChange={this.handleLanguageSelection}
          aria-label="website language"
        >
          <ToggleButton value="en" aria-label="English">
            <Flag name="gb" /> en
          </ToggleButton>
          <ToggleButton value="cn" aria-label="Chinese">
            <Flag name="cn" /> cn
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
}
LanguageSelector.contextType = globalContext;
export default LanguageSelector;
