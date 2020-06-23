import { AppBar, fade, IconButton, makeStyles, Theme, Toolbar, Tooltip, Typography } from "@material-ui/core";
import { WbIncandescent, WbIncandescentOutlined, Wifi, WifiOff } from "@material-ui/icons";
import React, { ReactElement, useContext } from "react";
import AppContext from "../contexts/AppContext";
import WebSocketContext from "../contexts/WebSocketContext";
import Logo from "./Logo";
import UserProfileButton from "./UserProfileButton";

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    backgroundColor: fade(theme.palette.background.paper, 0.67),
  },
}));

export default function NavBar(props: {title?: string, navIcon?: ReactElement<any>, tabs?: ReactElement<any>}) {
  const ws = useContext(WebSocketContext);
  const appContext = useContext(AppContext);
  const {darkMode, setDarkMode} = appContext;
  const classes = useStyles();

  const darkModeText = darkMode ? "Use Light Mode" : "Use Dark Mode";
  const darkModeButton = <Tooltip arrow title={darkModeText}>
    <IconButton onClick={() => setDarkMode(darkMode => !darkMode)}>
      {darkMode ? <WbIncandescent/> : <WbIncandescentOutlined/>}
    </IconButton>
  </Tooltip>;

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
      {darkModeButton}
      {connectionIndicator}
      <UserProfileButton/>
    </Toolbar>
    {props.tabs && <Toolbar variant="dense">{props.tabs}</Toolbar>}
  </AppBar>;
}
