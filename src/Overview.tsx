import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@material-ui/core";
import { Check, Clear } from "@material-ui/icons";
import React from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import { Link } from "react-router-dom";

export default function Overview() {
  const data = {
    "/a/b": {
      is_ok: true,
      battery_level: 0.87,
      status: "testing",
      location: "nowhere"
    },
    "/x/y": {
      is_ok: false,
      battery_level: 0.46,
      status: "broken",
      location: "nowhere"
    }
  };
  
  const items = Object.entries(data).map(([name, obj]) => {
    const href = `/robot/${btoa(name)}`;
    return <TableRow>
      <TableCell align="left">{name}</TableCell>
      <TableCell align="center">
        {obj.is_ok ? <Check/> : <Clear color="secondary"/>}
      </TableCell>
      <TableCell align="center">
        <PercentageDisplay value={obj.battery_level}/>
      </TableCell>
      <TableCell align="center">{obj.status}</TableCell>
      <TableCell align="center">{obj.location}</TableCell>
      <TableCell align="center">
        <Button component={Link} to={href} size="small" variant="outlined" color="primary">View</Button>
      </TableCell>
    </TableRow>;
  });

  return <div>
    <Typography component="h1" variant="h3">
      Overview
    </Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableCell align="left">Name</TableCell>
          <TableCell style={{width: "3em"}} align="center">OK</TableCell>
          <TableCell style={{width: "5em"}} align="center">Battery</TableCell>
          <TableCell align="center">Status</TableCell>
          <TableCell align="center">Location</TableCell>
          <TableCell style={{width: "80px"}} align="center"></TableCell>
        </TableHead>
        <TableBody>
          {items}
        </TableBody>
      </Table>
    </TableContainer>
  </div>;
}
