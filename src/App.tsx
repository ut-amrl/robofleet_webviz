import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import Detail from "./Detail";
import WebSocketTest from "./WebSocketTest";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Overview from "./Overview";
import { CssBaseline, Container, AppBar, Toolbar, IconButton, Box } from "@material-ui/core";
import NavBar from "./components/NavBar";

const serverUrl = "ws://localhost:8080";

function App() {
  const theme = createMuiTheme({
    palette: {
      type: "light",
      primary: {
        main: "#f57f17"
      },
      secondary: {
        main: "#b71c1c"
      }
    }
  });

  return <Router>
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  </Router>;
}

export default App;
