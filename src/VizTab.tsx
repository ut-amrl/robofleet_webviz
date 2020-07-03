import { Box, Checkbox, FormControlLabel, List, Snackbar, Switch } from "@material-ui/core";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import React, { useCallback, useContext, useState } from "react";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import CameraControls from "./components/CameraControls";
import CollapserItem from "./components/CollapserItem";
import LaserScanViewer from "./components/LaserScanViewer";
import Localization2DViewer from "./components/Localization2DViewer";
import SettingsPanel from "./components/SettingsPanel";
import VisualizationViewer from "./components/VisualizationViewer";
import WebSocketContext from "./contexts/WebSocketContext";
import useRobofleetMsgListener from "./hooks/useRobofleetMsgListener";
import useStorage from "./hooks/useStorage";
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

  const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason !== "clickaway")
      setLocAlertOpen(false);
  }

  const [locShowMap, setLocShowMap] = useStorage("Localization.showMap", true);
  const [scanShow, setScanShow] = useStorage("LaserScan.show", true);
  const [vizShowPoints, setVizShowPoints] = useStorage("Viz.showPoints", false);
  const [vizShowLines, setVizShowLines] = useStorage("Viz.showLines", false);

  const settingsPanel = <SettingsPanel>
    <List >
      <CollapserItem label="Localization">
        <FormControlLabel
          control={<Switch checked={locShowMap} onClick={() => setLocShowMap(s => !s)}/>}
          label="Show map"
        />
      </CollapserItem>
      <CollapserItem label="Laser Scan">
        <FormControlLabel
          control={<Switch checked={scanShow} onClick={() => setScanShow(s => !s)}/>}
          label="Show laser scan"
        />
      </CollapserItem>
      <CollapserItem label="Visualization">
        <FormControlLabel
          control={<Switch checked={vizShowPoints} onClick={() => setVizShowPoints(s => !s)}/>}
          label="Show points"
        />
        <FormControlLabel
          control={<Switch checked={vizShowLines} onClick={() => setVizShowLines(s => !s)}/>}
          label="Show lines"
        />
      </CollapserItem>
    </List>
  </SettingsPanel>;

  // just extract the controls to here and pass in props

  // since <Canvas> uses the react-three-fiber reconciler, we must forward
  // any contexts manually :(
  const viewers = <WebSocketContext.Provider value={ws}>
      <Localization2DViewer
        namespace={props.namespace}
        topic="localization"
        mapColor={0x536dfe}
        mapVisible={locShowMap}
        poseColor={0x8ECC47}
      />
      <LaserScanViewer 
        namespace={props.namespace}
        topic="velodyne_2dscan"
        matrix={baseLink}
        color={0xff6e40}
        visible={scanShow}
      />
      <VisualizationViewer
        namespace={props.namespace}
        topic="visualization"
        baseLinkMatrix={baseLink}
        pointsVisible={vizShowPoints}
        linesVisible={vizShowLines}
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
    {settingsPanel}
  </>;
}
