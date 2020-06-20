import { Box, Card, CircularProgress, Container, IconButton, Tab, Tabs, Typography, CardContent } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import React, { useState, useCallback } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import NavBar from "./components/NavBar";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import ImageryTab from "./ImageryTab";
import StatsTab from "./StatsTab";
import { matchAnyTopic } from "./util";
import VizTab from "./VizTab";

export function TabHider(props: {id: number, index: number, children: any}) {
  // currently, we render all tabs but hide invisible ones.
  // alternatively, don't render invisible ones for lower resource usage but more tab-switch latency.
  const style = (props.index === props.id) ? {} : {display: "none"};
  return <Container style={style}>
    {props.children}
  </Container>;
}

export default function Detail() {
  const {id} = useParams();
  const namespace = atob(id);
  const [tabIndex, setTabIndex] = useState(0);
  const [receivedMsg, setReceivedMsg] = useState(false);

  useRobofleetMsgListener(matchAnyTopic(namespace), useCallback((_, __) => setReceivedMsg(true), []));

  const loader = <Container maxWidth="md">
    <Box height="2em"/>
    <Card>
      <CardContent style={{display: "flex"}}>
        <CircularProgress variant="indeterminate" size={32} style={{marginRight: "1rem"}}/>
        <Typography variant="h5" component="h2">Waiting for data...</Typography>
      </CardContent>
    </Card>
  </Container>;

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

  const content = <>
    <TabHider id={0} index={tabIndex}><VizTab namespace={namespace}/></TabHider>
    <TabHider id={1} index={tabIndex}><ImageryTab namespace={namespace}/></TabHider>
    <TabHider id={2} index={tabIndex}><StatsTab namespace={namespace}/></TabHider>
  </>;

  return <>
    <NavBar 
      title={`Robot: ${namespace}`}
      navIcon={backIcon}
      tabs={tabs}
      />
    {receivedMsg ? content : loader}
  </>;
}
