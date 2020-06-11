import React, { useContext } from "react";
import { AppBar, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import { Home } from "@material-ui/icons";
import { Link } from "react-router-dom";
import WebSocketContext from "../contexts/WebSocketContext";
import { Wifi, WifiOff } from "@material-ui/icons";

export default function NavBar() {
  const ws = useContext(WebSocketContext);
  const connectionIndicator = ws?.state === "connected" ? <Wifi/> : <WifiOff color="disabled"/>;

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