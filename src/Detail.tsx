import { Avatar, Card, CardContent, Chip, CircularProgress, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useParams } from "react-router";
import useRobofleetMsgHandlers from "./hooks/useRobofleetMsgHandlers";
import { fb } from "./schema_generated";
import { matchNamespacedTopic, MsgHandlers, matchExactTopic } from "./util";

export default function Detail() {
  const {id} = useParams();
  const name = atob(id);
  const [receivedMsg, setReceivedMsg] = useState(false);
  const [pos, setPos] = useState([0, 0, 0]);
  const [vel, setVel] = useState([0, 0, 0]);

  const handlers: MsgHandlers = new Map();
  handlers.set(matchExactTopic(`${name}/odometry/raw`), (buf, match) => {
    const odom = fb.nav_msgs.Odometry.getRootAsOdometry(buf);
    setReceivedMsg(true);
    setPos([
      odom.pose()?.pose()?.position()?.x() ?? 0,
      odom.pose()?.pose()?.position()?.y() ?? 0,
      odom.pose()?.pose()?.position()?.z() ?? 0,
    ]);
    setVel([
      odom.twist()?.twist()?.linear()?.x() ?? 0,
      odom.twist()?.twist()?.linear()?.y() ?? 0,
      odom.twist()?.twist()?.linear()?.z() ?? 0,
    ]);
  });

  useRobofleetMsgHandlers(handlers);

  const positionDisplay = <Grid container item xs={2} direction="column" spacing={1}>
    <Grid item><Typography variant="h5">Position</Typography></Grid>
    <Grid item><Chip avatar={<Avatar>x</Avatar>} label={pos[0].toFixed(3)} /></Grid>
    <Grid item><Chip avatar={<Avatar>y</Avatar>} label={pos[1].toFixed(3)} /></Grid>
    <Grid item><Chip avatar={<Avatar>z</Avatar>} label={pos[2].toFixed(3)} /></Grid>
  </Grid>;

  const velocityDisplay = <Grid container item xs={2} direction="column" spacing={1}>
    <Grid item><Typography variant="h5">Velocity</Typography></Grid>
    <Grid item><Chip avatar={<Avatar>x</Avatar>} label={vel[0].toFixed(3)} /></Grid>
    <Grid item><Chip avatar={<Avatar>y</Avatar>} label={vel[1].toFixed(3)} /></Grid>
    <Grid item><Chip avatar={<Avatar>z</Avatar>} label={vel[2].toFixed(3)} /></Grid>
  </Grid>;

  const loader = <>
    <Grid item xs={1}>
      <CircularProgress variant="indeterminate" size={32}/>
    </Grid>
    <Grid item xs={11}>
      <Typography variant="h5" component="h2">Waiting for data...</Typography>
    </Grid>
  </>;

  const details = <>
    {positionDisplay}
    {velocityDisplay}
  </>;

  return <div>
    <Typography variant="h3" component="h2" style={{marginBottom: "0.25em"}}>
      Robot: {name}
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
