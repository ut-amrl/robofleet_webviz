import React, { useContext } from "react";
import { AppBar, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import { Home } from "@material-ui/icons";
import { Link } from "react-router-dom";
import WebSocketContext from "../contexts/WebSocketContext";
import { Wifi, WifiOff } from "@material-ui/icons";

export default function NavBar() {
  const ws = useContext(WebSocketContext);

  const indicateConnected = <>
    <Typography variant="body2" style={{marginRight: "0.5em"}}>Connected</Typography>
    <Wifi/>
  </>;
  const indicateDisconnected = <>
    <Typography variant="body2" style={{marginRight: "0.5em"}}>Disconnected</Typography>
    <WifiOff color="disabled"/>
  </>;
  const connectionIndicator = <div style={{display: "flex", alignItems: "center", marginRight: "1em"}}>
    {ws?.connected ? indicateConnected : indicateDisconnected}
  </div>;

  return <AppBar position="static" color="transparent">
    <Toolbar>
      <IconButton component={Link} to="/" edge="start" color="inherit" aria-label="home">
        <Home/>
      </IconButton>
      <Typography variant="h6" style={{flexGrow: 1}}>
        Robofleet
      </Typography>
      {connectionIndicator}
      <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>;
}