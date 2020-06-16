import { AppBar, Button, IconButton, Toolbar, Typography, Menu, MenuItem } from "@material-ui/core";
import { Wifi, WifiOff, AccountCircle } from "@material-ui/icons";
import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WebSocketContext from "../contexts/WebSocketContext";
import Logo from "./Logo";

export function UserProfileButton() {
  const ws = useContext(WebSocketContext);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [ipAddr, setIpAddr] = useState("<unknown>");

  useEffect(() => {
    const fetchIp = async () => {
    };
    fetchIp();
  }, [ws?.connected]);

  const handleClickOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };

  const doClose = () => {
    setAnchor(null);
  };

  const profileMenu = <Menu
    id="profile-menu"
    anchorEl={anchor}
    keepMounted
    open={Boolean(anchor)}
    onClose={doClose}
  >
    <MenuItem disabled>IP: {ipAddr}</MenuItem>
    <MenuItem onClick={doClose}>Sign in</MenuItem>
    <MenuItem onClick={doClose}>Logout</MenuItem>
  </Menu>;

  return <>
    <IconButton
      edge="end"
      aria-label="account of current user"
      aria-haspopup="true"
      onClick={handleClickOpen}
      color="inherit"
    >
      <AccountCircle/>
    </IconButton>
    {profileMenu}
  </>;
}

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
      <UserProfileButton/>
    </Toolbar>
  </AppBar>;
}