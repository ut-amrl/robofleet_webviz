import { Card, CardContent, CircularProgress, Grid, Typography, Chip, Avatar } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router";

export default function Detail() {
  const {id} = useParams();
  const name = atob(id);

  const positionDisplay = <Grid container item xs={2} direction="column" spacing={1}>
    <Grid item><Typography variant="h5">Position</Typography></Grid>
    <Grid item><Chip avatar={<Avatar>x</Avatar>} label="13.12" /></Grid>
    <Grid item><Chip avatar={<Avatar>y</Avatar>} label="13.12" /></Grid>
    <Grid item><Chip avatar={<Avatar>z</Avatar>} label="13.12" /></Grid>
  </Grid>;

  const velocityDisplay = <Grid container item xs={2} direction="column" spacing={1}>
    <Grid item><Typography variant="h5">Velocity</Typography></Grid>
    <Grid item><Chip avatar={<Avatar>x</Avatar>} label="13.12" /></Grid>
    <Grid item><Chip avatar={<Avatar>y</Avatar>} label="13.12" /></Grid>
    <Grid item><Chip avatar={<Avatar>z</Avatar>} label="13.12" /></Grid>
  </Grid>;

  return <div>
    <Typography variant="h3" component="h2">
      Robot: {name}
    </Typography>
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={1}>
            <CircularProgress variant="indeterminate" size={32}/>
          </Grid>
          <Grid item xs={11}>
            <Typography variant="h5" component="h2">Waiting for data...</Typography>
          </Grid>
          {positionDisplay}
          {velocityDisplay}
        </Grid>
      </CardContent>
    </Card>
  </div>;
}
