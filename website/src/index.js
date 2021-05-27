   import React from "react";
   import ReactDOM from "react-dom";
   import { BrowserRouter, Route, Switch } from "react-router-dom";

   import Page1 from "./UserForm.tsx";
   import Page2 from "./Map.tsx";

    const rootElement = document.getElementById("root");
    ReactDOM.render(
      <BrowserRouter>
       <Switch>
        <Route exact path="/" component={Page1} />
        <Route path="/Map" component={Page2} />
      </Switch>
      </BrowserRouter>,
      rootElement
    );