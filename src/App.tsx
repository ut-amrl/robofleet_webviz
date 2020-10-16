import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';
import useStorage from './hooks/useStorage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import config from './config';
import WebSocketContext from './contexts/WebSocketContext';
import Detail from './Detail';
import useWebSocket from './hooks/useWebSocket';
import Overview from './Overview';
import AppContext from './contexts/AppContext';
import IdTokenContext from './contexts/IdTokenContext';

function App() {
  const [darkMode, setDarkMode] = useStorage('App.darkMode', true);
  const [paused, setPaused] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f57f17',
      },
      secondary: {
        main: '#b71c1c',
      },
    },
  });

  const ws = useWebSocket({ url: config.serverUrl, paused, idToken });

  const appContext = {
    darkMode,
    setDarkMode,
    paused,
    setPaused,
  };

  const idTokenContext = {
    idToken,
    setIdToken,
  };

  return (
    <Router basename="/robofleet">
      <ThemeProvider theme={theme}>
        <AppContext.Provider value={appContext}>
          <WebSocketContext.Provider value={ws}>
            <IdTokenContext.Provider value={idTokenContext}>
              <CssBaseline />
              <Switch>
                <Route exact path="/">
                  <Overview />
                </Route>
                <Route exact path="/robot/:id">
                  <Detail />
                </Route>
              </Switch>
            </IdTokenContext.Provider>
          </WebSocketContext.Provider>
        </AppContext.Provider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
