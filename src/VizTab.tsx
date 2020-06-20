import { Box, Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import React, { useContext, useState, useCallback } from "react";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import CameraControls from "./components/CameraControls";
import LaserScanViewer from "./components/LaserScanViewer";
import Localization2DViewer from "./components/Localization2DViewer";
import WebSocketContext from "./contexts/WebSocketContext";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import { fb } from "./schema";
import { matchTopic } from "./util";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="standard" {...props}/>;
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

  // since <Canvas> uses the react-three-fiber reconciler, we must forward
  // any contexts manually :(
  const viewers = <WebSocketContext.Provider value={ws}>
      <Localization2DViewer
        namespace={props.namespace}
        topic="localization"
      />
      <LaserScanViewer 
        namespace={props.namespace}
        topic="velodyne_2dscan"
        matrix={baseLink}
        color={0xFFAA00}
      />
  </WebSocketContext.Provider>;

  const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason !== "clickaway")
      setLocAlertOpen(false);
  }

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
  </>;
}
