import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Fade,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Backdrop,
  LinearProgress,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { ArrowBack, Pause, PlayArrow } from '@material-ui/icons';
import React, { useCallback, useContext, useState, ReactElement } from 'react';
import { useParams, useHistory } from 'react-router';
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

export function TabHider(props: {
  id: number;
  index: number;
  render: (hidden: boolean) => ReactElement;
}) {
  const hidden = props.index !== props.id;
  const tabContent = props.render(hidden);
  return (
    <div style={{ display: hidden ? 'none' : undefined }}>{tabContent}</div>
  );
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
  const params = useParams<{ id: string; tab: string | undefined }>();
  const history = useHistory();
  const namespace = atob(params.id);
  const { idToken } = useContext(IdTokenContext);
  const tabIndex = params.tab ? Number.parseInt(params.tab) : 0;
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

  const loader = (
    <Container maxWidth="md">
      <Fade
        in={!receivedMsg}
        style={{ transitionDelay: !receivedMsg ? '1000ms' : '0' }}
      >
        <div>
          <Box height="2em" />
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
              <Box>
                <Typography variant="h5" component="h2">
                  Waiting for data
                </Typography>
                <Typography variant="body1" component="h2">
                  This robot may be offline.
                </Typography>
              </Box>
              <Box marginTop={3}>
                <LinearProgress />
              </Box>
            </CardContent>
          </Card>
        </div>
      </Fade>
    </Container>
  );

  if (!authorized) {
    const isLoading = authorized === null;
    return (
      <>
        <NavBar title={`${namespace}`} navIcon={backIcon}></NavBar>
        <Fade
          in={isLoading}
          style={{ transitionDelay: isLoading ? '500ms' : '0ms' }}
          unmountOnExit
        >
          <Backdrop open={true}>
            <CircularProgress />
          </Backdrop>
        </Fade>
        <Backdrop open={authorized === false}>
          <Box maxWidth="40em">
            <Alert severity="error">
              <AlertTitle>Not authorized</AlertTitle>
              You can view this robot if you sign in with an authorized account
              or view this page from an authorized IP address.
            </Alert>
          </Box>
        </Backdrop>
      </>
    );
  }

  const tabs = (
    <>
      <Tabs
        value={tabIndex}
        onChange={(_, index) => history.push(`/robot/${params.id}/${index}`)}
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
      <TabHider
        id={0}
        index={tabIndex}
        render={(hidden) => <VizTab namespace={namespace} enabled={!hidden} />}
      />
      <TabHider
        id={1}
        index={tabIndex}
        render={(hidden) => (
          <ImageryTab namespace={namespace} enabled={!hidden} />
        )}
      />
      <TabHider
        id={2}
        index={tabIndex}
        render={(hidden) => (
          <StatsTab namespace={namespace} enabled={!hidden} />
        )}
      />
    </>
  );

  return (
    <>
      <NavBar title={`${namespace}`} navIcon={backIcon} tabs={tabs} />
      {receivedMsg ? content : loader}
    </>
  );
}
