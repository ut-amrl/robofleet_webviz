import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import Detail from "./Detail";
import WebSocketTest from "./WebSocketTest";

const serverUrl = "ws://localhost:8080";

function App() {
  return <Router>
    <Link to="/">Home</Link>
    <Link to="/robot/1">Robot details</Link>
    <Switch>
      <Route exact path="/">
        <WebSocketTest url={serverUrl}/>
      </Route>
      <Route exact path="/robot/:id">
        <Detail/>
      </Route>
    </Switch>
  </Router>;
}

export default App;
