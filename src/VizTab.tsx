import { Box, Snackbar, Fab, makeStyles, Theme, createStyles, Zoom, Card, Grow, CardHeader, CardContent, Typography, IconButton, Avatar } from "@material-ui/core";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import React, { useContext, useState, useCallback, ReactElement } from "react";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import CameraControls from "./components/CameraControls";
import LaserScanViewer from "./components/LaserScanViewer";
import Localization2DViewer from "./components/Localization2DViewer";
import WebSocketContext from "./contexts/WebSocketContext";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import { fb } from "./schema";
import { matchTopic } from "./util";
import VisualizationViewer from "./components/VisualizationViewer";
import { Settings, Tune, Close } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    settingsContainer: {
      position: "relative",
      margin: theme.spacing(2),
    },
    fab: {
      position: "absolute",
    },
    settingsPanel: {
      position: "absolute",
      minWidth: "200px"
    },
  })
);

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="standard" {...props}/>;
}

export function SettingsPanel(props: {children?: React.ReactNode}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return <div className={classes.settingsContainer}> 
    <Grow in={open} timeout={200} style={{transformOrigin: "0 0 0"}}>
      <Card className={classes.settingsPanel}>
        <CardHeader
          action={
            <IconButton onClick={() => setOpen(false)} aria-label="close">
              <Close/>
            </IconButton>
          }
          title={
            <Typography variant="h6">
              Settings
            </Typography>
          }
        />
        <CardContent>
          {props.children}
        </CardContent>
      </Card>
    </Grow>
    <Zoom in={!open} timeout={200}>
      <Fab onClick={() => setOpen(true)} color="primary" className={classes.fab}>
        <Tune/>
      </Fab>
    </Zoom>
  </div>;
}

export default function VizTab(props: {namespace: string}) {
  const ws = useContext(WebSocketContext);
  const [locAlertOpen, setLocAlertOpen] = useState(true);
  const [baseLink, setBaseLink] = useState(new THREE.Matrix4());

  // build base_link transform using Localization2DMsg
  useRobofleetMsgListener(matchTopic(props.namespace, "localization"), useCallback((buf, match) => {
    const loc = fb.amrl_msgs.Localization2DMsg.getRootAsLocalization2DMsg(buf);
    const translation = new THREE.Matrix4().makeTranslation(
      loc.pose()?.x() ?? 0,
      loc.pose()?.y() ?? 0,
      0
    );
    const rotation = new THREE.Matrix4().makeRotationZ(loc.pose()?.theta() ?? 0);
    setBaseLink(translation.multiply(rotation));
    setLocAlertOpen(false);
  }, []));

  const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason !== "clickaway")
      setLocAlertOpen(false);
  }

  // since <Canvas> uses the react-three-fiber reconciler, we must forward
  // any contexts manually :(
  const viewers = <WebSocketContext.Provider value={ws}>
      <Localization2DViewer
        namespace={props.namespace}
        topic="localization"
        mapColor={0x536dfe}
        poseColor={0x8ECC47}
      />
      <LaserScanViewer 
        namespace={props.namespace}
        topic="velodyne_2dscan"
        matrix={baseLink}
        color={0xff6e40}
      />
      <VisualizationViewer
        namespace={props.namespace}
        topic="visualization"
        baseLinkMatrix={baseLink}
      />
  </WebSocketContext.Provider>;

  return <>
    <Box position="absolute" zIndex="-1" bottom="0" top="0" left="0" right="0">
      <Canvas
        orthographic={true}
        pixelRatio={window.devicePixelRatio}
      >
        <CameraControls/>
        {viewers}
      </Canvas>
    </Box>
    <Snackbar open={locAlertOpen} onClose={handleAlertClose}>
      <Alert severity="warning" onClose={handleAlertClose}>
        No localization available. Coordinate frames may be incorrect.
      </Alert>
    </Snackbar>
    <SettingsPanel>
      Hello world
    </SettingsPanel>
  </>;
}
