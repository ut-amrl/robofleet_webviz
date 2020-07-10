import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Backdrop,
} from '@material-ui/core';
import { ArrowBack, Pause, PlayArrow } from '@material-ui/icons';
import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import AppContext from './contexts/AppContext';
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import ImageryTab from './ImageryTab';
import StatsTab from './StatsTab';
import { matchAnyTopic } from './util';
import VizTab from './VizTab';
import IdTokenContext from './contexts/IdTokenContext';
import useAuthCheck from './hooks/useAuthCheck';

export function TabHider(props: { id: number; index: number; children: any }) {
  // currently, we only render visible tabls
  // alternatively, just hide invisible ones for less tab-switch latency but higher resource usage.
  // alternatively, support disabling updates for all child components somehow.
  const visible = props.index === props.id;
  return visible ? props.children : <></>;
}

export function PauseButton() {
  const { paused, setPaused } = useContext(AppContext);

  return (
    <Button
      color="primary"
      variant="outlined"
      startIcon={paused ? <PlayArrow /> : <Pause />}
      style={{ width: '100px' }}
      onClick={() => setPaused((paused) => !paused)}
    >
      {paused ? 'Play' : 'Pause'}
    </Button>
  );
}

export default function Detail() {
  const { id } = useParams();
  const namespace = atob(id);
  const { idToken } = useContext(IdTokenContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [receivedMsg, setReceivedMsg] = useState(false);

  // subscribe to all messages until we receive something
  useRobofleetMsgListener(
    matchAnyTopic(namespace),
    useCallback((_, __) => {
      setReceivedMsg(true);
    }, []),
    { enabled: !receivedMsg }
  );
  const authorized = useAuthCheck({
    idToken,
    op: 'receive',
    topic: `${namespace}/`,
  });

  const backIcon = (
    <IconButton component={Link} to="/">
      <ArrowBack />
    </IconButton>
  );

  if (!authorized) {
    return (
      <>
        <NavBar title={`${namespace}`} navIcon={backIcon}></NavBar>
        <Backdrop open={!authorized}>
          <Typography variant="subtitle1">
            Authorization check failed. Please sign in or use an authorized
            client to view robot details.
          </Typography>
        </Backdrop>
      </>
    );
  }

  const loader = (
    <Container maxWidth="md">
      <Box height="2em" />
      <Card>
        <CardContent style={{ display: 'flex' }}>
          <CircularProgress
            variant="indeterminate"
            size={32}
            style={{ marginRight: '1rem' }}
          />
          <Typography variant="h5" component="h2">
            Waiting for data...
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );

  const tabs = (
    <>
      <Tabs
        value={tabIndex}
        onChange={(_, index) => setTabIndex(index)}
        style={{ flexGrow: 1 }}
      >
        <Tab label="Viz" />
        <Tab label="Imagery" />
        <Tab label="Stats" />
      </Tabs>
      <PauseButton />
    </>
  );

  const content = (
    <>
      <TabHider id={0} index={tabIndex}>
        <VizTab namespace={namespace} />
      </TabHider>
      <TabHider id={1} index={tabIndex}>
        <ImageryTab namespace={namespace} />
      </TabHider>
      <TabHider id={2} index={tabIndex}>
        <StatsTab namespace={namespace} />
      </TabHider>
    </>
  );

  return (
    <>
      <NavBar title={`${namespace}`} navIcon={backIcon} tabs={tabs} />
      {receivedMsg ? content : loader}
    </>
  );
}
