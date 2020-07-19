import React from "react";

export const globalContext = React.createContext({});

const GlobalContextProvider = ({ children }) => {
  const [language, setLanguage] = React.useState("en");

  const context = {
    lang: {
      get: language,
      set: setLanguage,
    },
  };
  return (
    <globalContext.Provider value={context}>{children}</globalContext.Provider>
  );
};

export default GlobalContextProvider;
