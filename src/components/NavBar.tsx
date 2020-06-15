import { AppBar, Button, IconButton, Toolbar, Typography } from "@material-ui/core";
import { Wifi, WifiOff } from "@material-ui/icons";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import WebSocketContext from "../contexts/WebSocketContext";
import Logo from "./Logo";

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
      <IconButton size="medium" component={Link} to="/" edge="start" color="inherit" aria-label="home">
        <Logo/>
      </IconButton>
      <Typography variant="h6" style={{flexGrow: 1, marginLeft: "1rem"}}>
        Robofleet
      </Typography>
      {connectionIndicator}
      <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>;
}