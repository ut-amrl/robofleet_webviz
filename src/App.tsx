import React from "react";
import "./App.css";
import WebSocketTest from "./WebSocketTest";

const serverUrl = "ws://localhost:8080";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>RoboFleet WebSocket Test</p>
      </header>
      <WebSocketTest url={serverUrl}/>
    </div>
  );
}

export default App;
