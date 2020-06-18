import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import config from "./config";
import WebSocketContext from "./contexts/WebSocketContext";
import Detail from "./Detail";
import useWebSocket from "./hooks/useWebSocket";
import Overview from "./Overview";

function App() {
  const theme = createMuiTheme({
    palette: {
      type: "dark",
      primary: {
        main: "#f57f17"
      },
      secondary: {
        main: "#b71c1c"
      }
    }
  });

  const ws = useWebSocket({url: config.serverUrl});

  return <Router basename="/robofleet">
    <ThemeProvider theme={theme}>
      <WebSocketContext.Provider value={ws}>
        <CssBaseline/>
        <Switch>
          <Route exact path="/">
            <Overview/>
          </Route>
          <Route exact path="/robot/:id">
            <Detail/>
          </Route>
        </Switch>
      </WebSocketContext.Provider>
    </ThemeProvider>
  </Router>;
}

export default App;
