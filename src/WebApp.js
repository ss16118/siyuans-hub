import React, { Component } from "react";
import MediaQuery from "react-responsive";
import MobileApp from "./MobileApp";
import App from "./App";
class WebApp extends Component {
  render() {
    return (
      <React.Fragment>
        {/* Mobile device view */}
        <MediaQuery maxDeviceWidth={1224}>
          <MobileApp />
        </MediaQuery>
        {/* Desktop or laptop view */}
        <MediaQuery minDeviceWidth={1224}>
          <App />
        </MediaQuery>
      </React.Fragment>
    );
  }
}

export default WebApp;
