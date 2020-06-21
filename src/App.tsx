import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import config from "./config";
import WebSocketContext from "./contexts/WebSocketContext";
import Detail from "./Detail";
import useWebSocket from "./hooks/useWebSocket";
import Overview from "./Overview";
import AppContext from "./contexts/AppContext";
import useTimeTravelDispatcher from "./hooks/useTimeTravelDispatcher";

function App() {
  const timeTravelMaxCount = config.timeTravelMaxCount;
  const [darkMode, setDarkMode] = useState(true);

  const theme = createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
      primary: {
        main: "#f57f17"
      },
      secondary: {
        main: "#b71c1c"
      }
    }
  });

  const ws = useWebSocket({url: config.serverUrl});
  const dispatchTimeTravel = useTimeTravelDispatcher(ws, {maxCount: 128});

  const appContext = {
    darkMode, 
    setDarkMode, 
    timeTravelMaxCount,
    dispatchTimeTravel,
  };

  return <Router basename="/robofleet">
    <ThemeProvider theme={theme}>
    <AppContext.Provider value={appContext}>
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
    </AppContext.Provider>
    </ThemeProvider>
  </Router>;
}

export default App;
