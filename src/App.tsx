import { Box, Container, CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import WebSocketContext from "./contexts/WebSocketContext";
import Detail from "./Detail";
import useWebSocket from "./hooks/useWebSocket";
import Overview from "./Overview";

const serverUrl = "ws://localhost:8080";

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

  const ws = useWebSocket({url: serverUrl});

  return <Router basename="/robofleet">
    <ThemeProvider theme={theme}>
      <WebSocketContext.Provider value={ws}>
        <NavBar/>
        <Box height="2em"/>
        <Container component="main" maxWidth="md">
          <CssBaseline/>
          <Switch>
            <Route exact path="/">
              <Overview/>
            </Route>
            <Route exact path="/robot/:id">
              <Detail/>
            </Route>
          </Switch>
        </Container>
      </WebSocketContext.Provider>
    </ThemeProvider>
  </Router>;
}

export default App;
