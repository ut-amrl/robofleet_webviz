import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Avatar } from "@material-ui/core";
import { AccountCircle, ExitToApp, PersonAddDisabled } from "@material-ui/icons";
import config from "../config";
import React, { useState } from "react";
import { useGoogleLogin, useGoogleLogout, GoogleLoginResponse } from "react-google-login";
import useIpAddress from "../hooks/useIpAddress";
import btnGoogle from "../assets/btn_google.svg";

export function isGoogleLoginResponse(x: any): x is GoogleLoginResponse {
  return "getAuthResponse" in x;
}

export default function UserProfileButton() {
  const ipAddr = useIpAddress();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loginResponse, setLoginResponse] = useState<GoogleLoginResponse>();

  const clientId = config.googleClientId as string | null;
  const {signIn} = useGoogleLogin({
    clientId: clientId as string, // if it's null, we won't use the hook
    onSuccess: (res) => {
      if (!isGoogleLoginResponse(res))
        return;
      setSignedIn(true);
      setLoginResponse(res);
    },
    onFailure: () => {}
  });
  const {signOut} = useGoogleLogout({
    clientId: clientId as string, // if it's null, we won't use the hook
    onLogoutSuccess: () => {
      setSignedIn(false);
    }
  });

  const handleClickOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
  };

  const doClose = () => {
    setAnchor(null);
  };

  const doSignIn = () => {
    signIn();
    doClose();
  }

  const doSignOut = () => {
    signOut();
    doClose();
  }

  const signInButton = <MenuItem onClick={doSignIn}>
    <ListItemIcon><img alt="Google logo" width="32px" src={btnGoogle}/></ListItemIcon>
    <ListItemText>Sign in with Google</ListItemText>
  </MenuItem>;

  const signOutButton = <MenuItem onClick={doSignOut}>
    <ListItemIcon><ExitToApp/></ListItemIcon>
    <ListItemText>Sign out</ListItemText>
  </MenuItem>;

  const signInOutButton = signedIn ? signOutButton : signInButton;

  const noSignIn = <MenuItem disabled>
    <ListItemIcon><PersonAddDisabled/></ListItemIcon>
    <ListItemText>Sign in not configured.</ListItemText>
  </MenuItem>;

  let userIcon = <AccountCircle/>;
  if (signedIn) {
    userIcon = <Avatar 
      style={{width: "24px", height: "24px"}} 
      alt={loginResponse?.getBasicProfile().getGivenName()} 
      src={loginResponse?.getBasicProfile().getImageUrl()} 
    />; 
  }

  const profileMenu = <Menu
    id="profile-menu"
    anchorEl={anchor}
    keepMounted
    open={Boolean(anchor)}
    onClose={doClose}
  >
    <MenuItem disabled>
      <ListItemIcon><AccountCircle/></ListItemIcon>
      <ListItemText>{signedIn ? loginResponse?.getBasicProfile().getEmail() : "Not signed in."}</ListItemText>
    </MenuItem>
    <MenuItem disabled>
      <ListItemIcon>IP</ListItemIcon>
      <ListItemText><code>{ipAddr ?? "<unknown>"}</code></ListItemText>
    </MenuItem>
    <Divider/>
    {config.googleClientId ? signInOutButton : noSignIn}    
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
        {userIcon} 
      </IconButton>
    </Tooltip>
    {profileMenu}
  </>;
}