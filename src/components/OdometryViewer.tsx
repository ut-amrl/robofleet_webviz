import { Avatar, Chip, Grid, Typography } from '@material-ui/core';
import React, { useState, useCallback } from 'react';
import { fb } from '../schema';
import { matchTopic } from '../util';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';

export default function OdometryViewer(props: {
  namespace: string;
  enabled: boolean;
}) {
  const { namespace, enabled } = props;
  const [loaded, setLoaded] = useState(false);
  const [pos, setPos] = useState([0, 0, 0]);
  const [vel, setVel] = useState([0, 0, 0]);

  useRobofleetMsgListener(
    matchTopic(namespace, 'odometry/raw'),
    useCallback((buf, match) => {
      setLoaded(true);
      const odom = fb.nav_msgs.Odometry.getRootAsOdometry(buf);
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
    }, []),
    { enabled }
  );

  const positionDisplay = (
    <Grid container item xs={2} direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h5">Position</Typography>
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>x</Avatar>} label={pos[0].toFixed(3)} />
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>y</Avatar>} label={pos[1].toFixed(3)} />
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>z</Avatar>} label={pos[2].toFixed(3)} />
      </Grid>
    </Grid>
  );

  const velocityDisplay = (
    <Grid container item xs={2} direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h5">Velocity</Typography>
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>x</Avatar>} label={vel[0].toFixed(3)} />
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>y</Avatar>} label={vel[1].toFixed(3)} />
      </Grid>
      <Grid item>
        <Chip avatar={<Avatar>z</Avatar>} label={vel[2].toFixed(3)} />
      </Grid>
    </Grid>
  );

  if (!loaded) return <></>;

  return (
    <>
      {positionDisplay}
      {velocityDisplay}
    </>
  );
}
