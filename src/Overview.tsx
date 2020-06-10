import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@material-ui/core";
import { Check, Clear } from "@material-ui/icons";
import React from "react";
import PercentageDisplay from "./components/PercentageDisplay";
import { Link } from "react-router-dom";

export default function Overview() {
  return <div>
    <Typography component="h1" variant="h3">
      Overview
    </Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableCell padding="checkbox" align="center"></TableCell>
          <TableCell align="left">Robot</TableCell>
          <TableCell align="center">OK</TableCell>
          <TableCell align="center">Battery</TableCell>
          <TableCell align="center">Status</TableCell>
          <TableCell align="center">Location</TableCell>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell padding="checkbox" align="center">
              <Button component={Link} to="/robot/1" size="small" variant="outlined" color="primary">View</Button>
            </TableCell>
            <TableCell align="left">testbot</TableCell>
            <TableCell align="center">
              <Check/>
            </TableCell>
            <TableCell align="center">
              <PercentageDisplay value={0.87}/>
            </TableCell>
            <TableCell align="center">Testing</TableCell>
            <TableCell align="center">Nowhere</TableCell>
          </TableRow>
          <TableRow>
            <TableCell padding="checkbox" align="center">
              <Button component={Link} to="/robot/2" size="small" variant="outlined" color="primary">View</Button>
            </TableCell>
            <TableCell align="left">testbot</TableCell>
            <TableCell align="center">
              <Clear color="secondary"/>
            </TableCell>
            <TableCell align="center">
              <PercentageDisplay value={0.33}/>
            </TableCell>
            <TableCell align="center">Testing</TableCell>
            <TableCell align="center">Nowhere</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </div>;
}
