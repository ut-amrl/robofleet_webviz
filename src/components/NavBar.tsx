import { AppBar, Chip, Divider, Drawer, IconButton, List, ListItem, Toolbar, Typography } from "@material-ui/core";
import { AccountCircle, Wifi, WifiOff } from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../config";
import WebSocketContext from "../contexts/WebSocketContext";
import Logo from "./Logo";

export function IpAddress() {
  const [ipAddr, setIpAddr] = useState("<unknown>");

  useEffect(() => {
    const fetchIp = async () => {
      const baseUrl = new URL(config.serverUrl);
      baseUrl.protocol = window.location.protocol;
      const res = await fetch(new URL("echo-ip", baseUrl).toString());
      if (res.status === 200) {
        setIpAddr(await res.text());
      }
    };
    fetchIp();
  }, []);

  return <span>{ipAddr}</span>;
}

export function UserProfileButton() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleClickOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };

  const doClose = () => {
    setAnchor(null);
  };

  const profileMenu = <Drawer
    id="profile-menu"
    anchor="right"
    keepMounted
    open={Boolean(anchor)}
    onClose={doClose}
  >
    <List>
      <ListItem>
        <div style={{marginRight: "1rem"}}>IP</div> 
        <Chip label={<code><IpAddress/></code>}/>
      </ListItem>
      <Divider/>
      <ListItem button onClick={doClose}>Sign in</ListItem>
      <ListItem button onClick={doClose}>Logout</ListItem>
    </List>
  </Drawer>;

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