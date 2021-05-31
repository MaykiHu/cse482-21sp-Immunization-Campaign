   import React from "react";
   import ReactDOM from "react-dom";
   import history from "./history";
   import { Router, Route, Switch } from "react-router-dom";

   import Page1 from "./UserForm.tsx";
   import Page2 from "./Map.jsx";

    const rootElement = document.getElementById("root");
    ReactDOM.render(
      <Router history={history}>
       <Switch>
        <Route exact path="/" component={Page1} />
        <Route path="/Map" component={Page2} />
      </Switch>
      </Router>,
      rootElement
    );