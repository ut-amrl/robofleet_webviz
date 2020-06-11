import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { Check, Clear } from "@material-ui/icons";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import PercentageDisplay from "./components/PercentageDisplay";
import useRobofleetMsgHandlers from "./hooks/useRobofleetMsgHandlers";
import { matchNamespacedTopic, MsgHandlers } from "./util";
import { fb } from "./schema_generated";

type RobotStatus = {name: string, is_ok: boolean, battery_level: number, status: string, location: string};

export default function Overview() {
  const [data, setData] = useState({} as {[name: string]: RobotStatus});

  const msgHandlers: MsgHandlers = new Map();
  msgHandlers.set(matchNamespacedTopic("status"), (buf, match) => {
    const name = match[1];
    const status = fb.amrl_msgs.RobofleetStatus.getRootAsRobofleetStatus(buf);
    setData(data => ({
      ...data, 
      [name]: {
        name: name,
        is_ok: status.isOk(),
        battery_level: status.batteryLevel(),
        status: status.status() ?? "",
        location: status.location() ?? ""
      }
    }));
  });

  useRobofleetMsgHandlers(msgHandlers);

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
