import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import { Home } from "@material-ui/icons";
import { Link } from "react-router-dom";

export default function NavBar() {
  return <AppBar position="static" color="transparent">
    <Toolbar>
      <IconButton component={Link} to="/" edge="start" color="inherit" aria-label="home">
        <Home/>
      </IconButton>
      <Typography variant="h6" style={{flexGrow: 1}}>
        Robofleet
      </Typography>
      <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>;
}