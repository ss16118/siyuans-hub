import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import WebApp from "./WebApp";
import * as serviceWorker from "./serviceWorker";
import GlobalContextProvider from "./components/siteContext";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";

/* Easter Egg */
figlet.parseFont("Standard", standard);
figlet.text(
  "Welcome to\nSiyuan's Hub",
  {
    font: "Standard",
  },
  function (_, data) {
    console.log(data);
  }
);

ReactDOM.render(
  <GlobalContextProvider>
    <WebApp />
  </GlobalContextProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
