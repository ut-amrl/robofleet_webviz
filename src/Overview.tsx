import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { Check, Clear } from '@material-ui/icons';
import SyncDisabled from '@material-ui/icons/SyncDisabled';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactElement,
} from 'react';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import PercentageDisplay from './components/PercentageDisplay';
import AppContext from './contexts/AppContext';
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import { fb } from './schema';
import { matchTopicAnyNamespace } from './util';
import config from './config';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type RobotStatus = {
  name: string;
  is_ok: boolean;
  battery_level: number;
  status: string;
  location: string;
  is_active: boolean;
  last_updated: string;
};

type StaticRobotInfo = {
  name: string;
  ip: string;
  lastStatus: string;
  lastLocation: string;
  lastUpdated: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  inactive: {
    '& td': {
      color: theme.palette.text.secondary,
    },
  },
}));

const MaybeDisconnectedLabel = (props: {
  label: ReactElement | string;
  disconnected: boolean;
}) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {props.disconnected && <SyncDisabled fontSize="small" />}
      <div>{props.label}</div>
    </Box>
  );
};

export default function Overview() {
  const { setPaused } = useContext(AppContext);
  const [data, setData] = useState({} as { [name: string]: RobotStatus });
  const classes = useStyles();

  useEffect(() => {
    setPaused(false);
  }, [setPaused]);

  useRobofleetMsgListener(
    matchTopicAnyNamespace('status'),
    useCallback((buf, match) => {
      const name = match[1];
      const status = fb.amrl_msgs.RobofleetStatus.getRootAsRobofleetStatus(buf);
      setData((data) => ({
        ...data,
        [name]: {
          name: name,
          is_ok: status.isOk(),
          battery_level: status.batteryLevel(),
          status: status.status() ?? '',
          location: status.location() ?? '',
          is_active: true,
          last_updated: 'now',
        },
      }));
    }, [])
  );

  useEffect(() => {
    (async () => {
      const baseUrl = new URL(config.serverUrl);
      baseUrl.protocol = window.location.protocol;
      const url = new URL('robots', baseUrl).toString();
      const res = await fetch(url, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        try {
          const robotInfo = (await res.json()) as Array<StaticRobotInfo>;
          robotInfo.forEach((robot) => {
            const name = '/' + robot.name;
            setData((data) => ({
              [name]: {
                name,
                is_ok: true,
                battery_level: -1,
                status: robot.lastStatus,
                location: robot.lastLocation,
                is_active: false,
                last_updated: dayjs(robot.lastUpdated).fromNow(),
              },
              // don't overwrite any live robot data with this static info
              ...data,
            }));
          });
        } catch (err) {
          console.error(`Failed to fetch static robot info`, err);
        }
      }
    })();
  }, []);

  const tableHead = (
    <TableHead>
      <TableRow>
        <TableCell align="left">Name</TableCell>
        <TableCell style={{ width: '3em' }} align="center">
          OK
        </TableCell>
        <TableCell style={{ width: '5em' }} align="center">
          Battery
        </TableCell>
        <TableCell align="center">Status</TableCell>
        <TableCell align="center">Location</TableCell>
        <TableCell align="center">Last seen</TableCell>
      </TableRow>
    </TableHead>
  );

  const sortedData = useMemo(
    () =>
      Object.entries(data).sort(
        ([_, a], [__, b]) => Number(b.is_active) - Number(a.is_active)
      ),
    [data]
  );

  const items = sortedData.map(([name, obj]) => {
    let batteryContent: ReactElement | string;
    if (obj.battery_level >= 0) {
      batteryContent = <PercentageDisplay value={obj.battery_level} />;
    } else {
      batteryContent = 'unknown';
    }

    const nameContent = obj.is_active ? (
      <Button
        component={Link}
        to={`/robot/${btoa(name)}`}
        style={{ textTransform: 'none' }}
        variant="outlined"
        disabled={!obj.is_active}
      >
        {name}
      </Button>
    ) : (
      <Typography variant="button" style={{ textTransform: 'none' }}>
        {name} (Offline)
      </Typography>
    );

    return (
      <TableRow key={name} className={obj.is_active ? '' : classes.inactive}>
        <TableCell align="left">{nameContent}</TableCell>
        <TableCell align="center">
          {obj.is_ok ? <Check /> : <Clear color="error" />}
        </TableCell>
        <TableCell align="center">{batteryContent}</TableCell>
        <TableCell align="center">
          <MaybeDisconnectedLabel
            label={obj.status}
            disconnected={!obj.is_active}
          />
        </TableCell>
        <TableCell align="center">
          <MaybeDisconnectedLabel
            label={obj.location}
            disconnected={!obj.is_active}
          />
        </TableCell>
        <TableCell align="center">{obj.last_updated}</TableCell>
      </TableRow>
    );
  });

  return (
    <>
      <NavBar />
      <Box height="2em" />
      <Container component="main" maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          style={{ marginBottom: '0.25em' }}
        >
          Robots
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            {tableHead}
            <TableBody>{items}</TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
