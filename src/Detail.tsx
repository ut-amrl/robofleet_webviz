import { Card, CardContent, CircularProgress, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useParams } from "react-router";
import OdometryViewer from "./components/OdometryViewer";
import { matchAnyTopic } from "./util";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";

export default function Detail() {
  const {id} = useParams();
  const namespace = atob(id);
  const [receivedMsg, setReceivedMsg] = useState(false);

  useRobofleetMsgListener(matchAnyTopic(namespace), (_, __) => setReceivedMsg(true));
  
  const details = <>
    <OdometryViewer namespace={namespace}/>
  </>;

  const loader = <>
    <Grid item xs={1}>
      <CircularProgress variant="indeterminate" size={32}/>
    </Grid>
    <Grid item xs={11}>
      <Typography variant="h5" component="h2">Waiting for data...</Typography>
    </Grid>
  </>;

  return <div>
    <Typography variant="h3" component="h2" style={{marginBottom: "0.25em"}}>
      Robot: {namespace}
    </Typography>
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {receivedMsg ? details : loader}
        </Grid>
      </CardContent>
    </Card>
  </div>;
}
