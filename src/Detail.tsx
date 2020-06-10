import React from "react";
import { Container, Paper, CircularProgress, Card, CardContent, Typography, Grid } from "@material-ui/core";
import { useParams } from "react-router";

export default function Detail() {
  const {id} = useParams();

  return <div>
    <Typography variant="h3" component="h2">
      Robot: {id}
    </Typography>
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <CircularProgress variant="indeterminate" size={32}/>
          </Grid>
          <Grid item>
            <Typography variant="h5" component="h2">Waiting for data...</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </div>;
}
