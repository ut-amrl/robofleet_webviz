import { Box, Card, CardContent, CircularProgress, Container, Grid, IconButton, Tab, Tabs, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import React, { useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Localization2DViewer from "./components/Localization2DViewer";
import NavBar from "./components/NavBar";
import OdometryViewer from "./components/OdometryViewer";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import { matchAnyTopic } from "./util";

export function VizTab(props: any) {
  return <Localization2DViewer {...props}/>;
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
