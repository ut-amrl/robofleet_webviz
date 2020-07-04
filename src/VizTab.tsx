import { Box, Checkbox, makeStyles, createStyles, Theme, FormControlLabel, FormGroup, List, Snackbar, Switch, Button } from "@material-ui/core";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import React, { useCallback, useContext, useState, useRef } from "react";
import { Canvas, useThree, ReactThreeFiber } from "react-three-fiber";
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
import { flatbuffers } from "flatbuffers";
import { fb } from "./schema";
import { matchTopic } from "./util";
import CanvasUtils, { CanvasUtilsRef } from "./components/CanvasUtils";

function createPose2DfMsg({namespace, x, y, theta}:
    {namespace: string, x: number, y: number, theta: number}) {
  const fbb = new flatbuffers.Builder();
  const pose = fb.amrl_msgs.Pose2Df.createPose2Df(
    fbb,
    fb.MsgMetadata.createMsgMetadata(
      fbb,
      fbb.createString("amrl_msgs/Pose2Df"),
      fbb.createString(`${namespace}/move_base_simple/goal`)
    ),
    x,
    y,
    theta
  );
  fbb.finish(pose);
  return fbb.asUint8Array();
}

// oof
// not sure why we don't get createX() methods for some of these
function createLocalization2DMsg({namespace, frame="map", map, x, y, theta}:
    {namespace: string, frame?: string, map: string, x: number, y: number, theta: number}) {
  const fbb = new flatbuffers.Builder();

  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString("amrl_msgs/Localization2DMsg"),
    fbb.createString(`${namespace}/initialpose`)
  );

  const stampOffset = fb.RosTime.createRosTime(
    fbb,
    Math.floor(Date.now() / 1000),
    0
  );

  const frameOffset = fbb.createString(frame);

  fb.std_msgs.Header.startHeader(fbb);
  fb.std_msgs.Header.addFrameId(fbb, frameOffset);
  fb.std_msgs.Header.addSeq(fbb, 0); // TODO idk
  fb.std_msgs.Header.addStamp(fbb, stampOffset);
  const headerOffset = fb.std_msgs.Header.endHeader(fbb);

  const mapOffset = fbb.createString(map);

  const poseOffset = fb.amrl_msgs.Pose2Df.createPose2Df(
    fbb,
    0,
    x,
    y,
    theta
  );

  fb.amrl_msgs.Localization2DMsg.startLocalization2DMsg(fbb);
  fb.amrl_msgs.Localization2DMsg.add_Metadata(fbb, metadataOffset);
  fb.amrl_msgs.Localization2DMsg.addHeader(fbb, headerOffset);
  fb.amrl_msgs.Localization2DMsg.addMap(fbb, mapOffset);
  fb.amrl_msgs.Localization2DMsg.addPose(fbb, poseOffset);
  const loc = fb.amrl_msgs.Localization2DMsg.endLocalization2DMsg(fbb);

  fbb.finish(loc);
  return fbb.asUint8Array();
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="standard" {...props}/>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Default: {
      cursor: 'default'
    },
    Localize: {
      cursor: 'crosshair'
    },
    SetNav: {
      cursor: 'crosshair'
    },
  })
);

export default function VizTab(props: {namespace: string}) {
  type ClickAction = "Default" | "Localize" | "SetNav";

  const ws = useContext(WebSocketContext);
  const canvasUtils = useRef<CanvasUtilsRef>(null);
  const classes = useStyles();

  const [locAlertOpen, setLocAlertOpen] = useState(true);
  const [baseLink, setBaseLink] = useState(new THREE.Matrix4());
  const [clickAction, setClickAction] = useState<ClickAction>("Default");

  const [locShowMap, setLocShowMap] = useStorage("Localization.showMap", true);
  const [scanShow, setScanShow] = useStorage("LaserScan.show", true);
  const [vizShowPoints, setVizShowPoints] = useStorage("Viz.showPoints", false);
  const [vizShowLines, setVizShowLines] = useStorage("Viz.showLines", false);

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

  const clickCanvas = () => {
    if (clickAction === "Default") {
      return;
    }
    if (clickAction === "Localize") {
      const pos = canvasUtils.current?.worldMousePos;

      if (ws?.connected) {
        ws.ws?.send(createLocalization2DMsg({
          namespace: props.namespace,
          frame: "map",
          map: "n/a", // TODO: map selector?
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
          theta: 0 // TODO: implement drag to set angle
        }));
      }
    } 
    if (clickAction === "SetNav") {
      const pos = canvasUtils.current?.worldMousePos;

      if (ws?.connected) { 
        ws.ws?.send(createPose2DfMsg({
          namespace: props.namespace,
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
          theta: 0 // TODO: implement drag to set angle
        }));
      }
      // TODO: remove (fix Z coord)
      console.log(pos);
    }
  }

  // settings panel and FAB
  const settingsPanel = <SettingsPanel>
    <List >
      <CollapserItem label="Localization">
        <FormGroup row>
          <FormControlLabel
            control={<Switch checked={locShowMap} onClick={() => setLocShowMap(s => !s)}/>}
            label="Show map"
          />
        </FormGroup>
        <FormGroup row>
          <Button 
            onClick={() => setClickAction(a => (a === "Localize") ? "Default" : "Localize")}
            variant="outlined"
          >
            Set Pose
          </Button>
          <Box flexGrow="1" />
          <Button 
            onClick={() => setClickAction(a => (a === "SetNav") ? "Default" : "SetNav")}
            variant="outlined"
          >
            Set NavGoal
          </Button>
        </FormGroup>
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

  // these viewers will be rendered into the <Canvas>
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

  // only close a snackbar if the close button was pressed
  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason !== "clickaway")
      setLocAlertOpen(false);
  }

  return <>
    <Box position="absolute" zIndex="-1" bottom="0" top="0" left="0" right="0">
      <Canvas
        orthographic={true}
        pixelRatio={window.devicePixelRatio}
        onClick={clickCanvas}
        className={classes[clickAction]}
      >
        <CanvasUtils ref={canvasUtils}/>
        <CameraControls/>
        {viewers}
      </Canvas>
    </Box>
    <Snackbar open={locAlertOpen} onClose={handleSnackbarClose}>
      <Alert severity="warning" onClose={handleSnackbarClose}>
        No localization available. Coordinate frames may be incorrect.
      </Alert>
    </Snackbar>
    {settingsPanel}
  </>;
}
