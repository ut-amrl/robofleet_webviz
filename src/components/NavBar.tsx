import { AppBar, Divider, fade, IconButton, ListItemIcon, ListItemText, makeStyles, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@material-ui/core";
import { AccountCircle, PersonAdd, Wifi, WifiOff } from "@material-ui/icons";
import React, { ReactElement, useContext, useState } from "react";
import WebSocketContext from "../contexts/WebSocketContext";
import useIpAddress from "../hooks/useIpAddress";
import Logo from "./Logo";

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    backgroundColor: fade(theme.palette.background.paper, 0.67),
  },
}));

export function UserProfileButton() {
  const ipAddr = useIpAddress();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

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
    <MenuItem disabled>
      <ListItemIcon>IP</ListItemIcon>
      <ListItemText><code>{ipAddr ?? "<unknown>"}</code></ListItemText>
    </MenuItem>
    <Divider/>
    <MenuItem onClick={doClose}>
      <ListItemIcon><PersonAdd/></ListItemIcon>
      <ListItemText>Sign in</ListItemText>
    </MenuItem>
  </Menu>;

  return <>
    <Tooltip arrow title="User Account">
      <IconButton
        edge="end"
        aria-label="account of current user"
        aria-haspopup="true"
        onClick={handleClickOpen}
        color="inherit"
      >
        <AccountCircle/>
      </IconButton>
    </Tooltip>
    {profileMenu}
  </>;
}

export default function NavBar(props: {title?: string, navIcon?: ReactElement<any>, tabs?: ReactElement<any>}) {
  const ws = useContext(WebSocketContext);
  const classes = useStyles();

  const indicateConnected = <Wifi/>;
  const indicateDisconnected = <WifiOff color="disabled"/>;
  const connectionIndicator = <Tooltip arrow title={ws?.ws?.url ?? "Server unknown"}>
    <IconButton>
      {ws?.connected ? indicateConnected : indicateDisconnected}
    </IconButton>
  </Tooltip>;

  return <AppBar position="static" color="transparent" className={classes.toolbar}>
    <Toolbar variant="dense">
      {props.navIcon ?? <IconButton><Logo/></IconButton>}
      <Typography variant="h6" style={{flexGrow: 1, marginLeft: "1rem"}}>
        {props.title ?? "Robofleet"}
      </Typography>
      {connectionIndicator}
      <UserProfileButton/>
    </Toolbar>
    {props.tabs}
  </AppBar>;
}