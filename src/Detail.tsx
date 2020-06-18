import { Box, Card, CardContent, CircularProgress, Container, Grid, IconButton, Tab, Tabs, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import React, { useState, useContext } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Localization2DViewer from "./components/Localization2DViewer";
import NavBar from "./components/NavBar";
import OdometryViewer from "./components/OdometryViewer";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import { matchAnyTopic } from "./util";
import { Canvas } from "react-three-fiber";
import CameraControls from "./components/CameraControls";
import WebSocketContext from "./contexts/WebSocketContext";

export function VizTab(props: any) {
  const ws = useContext(WebSocketContext);

  // since <Canvas> uses the react-three-fiber reconciler, we must forward
  // any contexts manually :(
  const viewers = <WebSocketContext.Provider value={ws}>
      <Localization2DViewer {...props}/>
  </WebSocketContext.Provider>;

  return <Box position="absolute" zIndex="-1" bottom="0" top="0" left="0" right="0">
    <Canvas
      orthographic={true}
      pixelRatio={window.devicePixelRatio}
    >
      <CameraControls/>
      {viewers}
    </Canvas>;
  </Box>;
}

export function ImageryTab(props: any) {
  return <></>;
}

export function StatsTab(props: any) {
  return <Container maxWidth="md">
    <Box height="2em"/>
    <Card>
      <CardContent>
        <OdometryViewer {...props}/>
      </CardContent>
    </Card>
  </Container>;
}

export default function Detail() {
  const {id} = useParams();
  const namespace = atob(id);
  const [tabIndex, setTabIndex] = useState(0);
  const [receivedMsg, setReceivedMsg] = useState(false);

  useRobofleetMsgListener(matchAnyTopic(namespace), (_, __) => setReceivedMsg(true));

  const loader = <>
    <Grid item xs={1}>
      <CircularProgress variant="indeterminate" size={32}/>
    </Grid>
    <Grid item xs={11}>
      <Typography variant="h5" component="h2">Waiting for data...</Typography>
    </Grid>
  </>;

  const backIcon = <IconButton component={Link} to="/">
    <ArrowBack/>
  </IconButton>;

  const tabs = <Tabs
    value={tabIndex}
    onChange={(_, index) => setTabIndex(index)}
    >
    <Tab label="Viz"/>
    <Tab label="Imagery"/>
    <Tab label="Stats"/>
  </Tabs>;

  return <>
    <NavBar 
      title={`Robot: ${namespace}`}
      navIcon={backIcon}
      tabs={tabs}
      />
    {tabIndex === 0 && <VizTab namespace={namespace}/>}
    {tabIndex === 1 && <ImageryTab namespace={namespace}/>}
    {tabIndex === 2 && <StatsTab namespace={namespace}/>}
  </>;
}
