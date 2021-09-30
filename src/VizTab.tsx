import {
  Box,
  Button,
  createStyles,
  FormControlLabel,
  FormGroup,
  List,
  makeStyles,
  Snackbar,
  Switch,
  Theme,
  Select,
  MenuItem,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { flatbuffers } from 'flatbuffers';
import React, { useCallback, useContext, useState, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import * as THREE from 'three';
import CameraControls from './components/CameraControls';
import CollapserItem from './components/CollapserItem';
import LaserScanViewer from './components/LaserScanViewer';
import Localization2DViewer from './components/Localization2DViewer';
import SettingsPanel from './components/SettingsPanel';
import VisualizationViewer from './components/VisualizationViewer';
import WebSocketContext from './contexts/WebSocketContext';
import useRobofleetMsgListener from './hooks/useRobofleetMsgListener';
import useStorage from './hooks/useStorage';
import { fb } from './schema';
import { matchTopic } from './util';
import PoseSetter from './components/PoseSetter';
import config from './config';

function createPoseStampedMsg({
  namespace,
  topic,
  frame = 'map',
  x,
  y,
  theta,
}: {
  namespace: string;
  topic: string;
  frame: string;
  x: number;
  y: number;
  theta: number;
}) {
  const fbb = new flatbuffers.Builder();

  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('geometry_msgs/PoseStamped'),
    fbb.createString(`${namespace}/${topic}`)
  );

  const frameOffset = fbb.createString(frame);

  fb.std_msgs.Header.startHeader(fbb);
  fb.std_msgs.Header.addStamp(
    fbb,
    fb.RosTime.createRosTime(fbb, Math.floor(Date.now() / 1000), 0)
  );

  fb.std_msgs.Header.addFrameId(fbb, frameOffset);
  const headerOffset = fb.std_msgs.Header.endHeader(fbb);

  const positionOffset = fb.geometry_msgs.Vector3.createVector3(
    fbb,
    0,
    x,
    y,
    0
  );
  const z = Math.sin(theta / 2);
  const w = Math.cos(theta / 2);
  const orientationOffset = fb.geometry_msgs.Quaternion.createQuaternion(
    fbb,
    0,
    0,
    0,
    z,
    w
  );

  fb.geometry_msgs.Pose.startPose(fbb);
  fb.geometry_msgs.Pose.addPosition(fbb, positionOffset);
  fb.geometry_msgs.Pose.addOrientation(fbb, orientationOffset);
  const poseOffset = fb.geometry_msgs.Pose.endPose(fbb);

  fb.geometry_msgs.PoseStamped.startPoseStamped(fbb);
  fb.geometry_msgs.PoseStamped.add_Metadata(fbb, metadataOffset);
  fb.geometry_msgs.PoseStamped.addHeader(fbb, headerOffset);
  fb.geometry_msgs.PoseStamped.addPose(fbb, poseOffset);
  const stampedOffset = fb.geometry_msgs.PoseStamped.endPoseStamped(fbb);

  fbb.finish(stampedOffset);
  return fbb.asUint8Array();
}

// oof
// not sure why we don't get createX() methods for some of these
function createLocalization2DMsg({
  namespace,
  frame = 'map',
  map,
  x,
  y,
  theta,
}: {
  namespace: string;
  frame?: string;
  map: string;
  x: number;
  y: number;
  theta: number;
}) {
  const fbb = new flatbuffers.Builder();

  const metadataOffset = fb.MsgMetadata.createMsgMetadata(
    fbb,
    fbb.createString('amrl_msgs/Localization2DMsg'),
    fbb.createString(`${namespace}/initialpose`)
  );

  const frameOffset = fbb.createString(frame);

  fb.std_msgs.Header.startHeader(fbb);
  fb.std_msgs.Header.addStamp(
    fbb,
    fb.RosTime.createRosTime(fbb, Math.floor(Date.now() / 1000), 0)
  );

  fb.std_msgs.Header.addFrameId(fbb, frameOffset);
  const headerOffset = fb.std_msgs.Header.endHeader(fbb);

  const mapOffset = fbb.createString(map);

  const poseOffset = fb.amrl_msgs.Pose2Df.createPose2Df(fbb, 0, x, y, theta);
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
  return <MuiAlert elevation={6} variant="standard" {...props} />;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Default: {
      cursor: 'default',
    },
    Localize: {
      cursor: 'crosshair',
    },
    SetNav: {
      cursor: 'pointer',
    },
    VizControl: {
      margin: theme.spacing(2, 0),
    },
  })
);

export default function VizTab(props: { namespace: string; enabled: boolean }) {
  type ClickAction = 'Default' | 'Localize' | 'SetNav';
  const { enabled } = props;

  const ws = useContext(WebSocketContext);
  const classes = useStyles();

  const [locAlertOpen, setLocAlertOpen] = useState(true);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);

  const [clickAction, setClickAction] = useState<ClickAction>('Default');

  const [mapName, setMapName] = useState('EmptyMap');
  const [chosenMap, setChosenMap] = useState<string | undefined>(undefined);
  const [mapOptions, setMapOptions] = useState([{ name: 'EmptyMap' }]);
  const [locShowMap, setLocShowMap] = useStorage('Localization.showMap', true);
  const [locShowNavMap, setLocShowNavMap] = useStorage(
    'Localization.showNavMap',
    true
  );
  const [scanShow, setScanShow] = useStorage('LaserScan.show', true);
  const [vizShowPoints, setVizShowPoints] = useStorage('Viz.showPoints', false);
  const [vizShowLines, setVizShowLines] = useStorage('Viz.showLines', false);

  // build base_link transform using Localization2DMsg
  useRobofleetMsgListener(
    matchTopic(props.namespace, 'localization'),
    useCallback(
      (buf, match) => {
        const loc = fb.amrl_msgs.Localization2DMsg.getRootAsLocalization2DMsg(
          buf
        );
        setX(loc.pose()?.x() ?? 0);
        setY(loc.pose()?.y() ?? 0);
        setTheta(loc.pose()?.theta() ?? 0);
        setMapName(loc.map() ?? mapName);
        setLocAlertOpen(false);
      },
      [mapName]
    ),
    { enabled }
  );

  // Loading map names
  useEffect(() => {
    const loadMapDir = async () => {
      const res = await fetch(config.mapDirUrl);
      if (res.ok) {
        try {
          let maps = await res.json();
          setMapOptions(
            maps.map((map: string) => ({
              name: map,
            }))
          );
        } catch (err) {
          console.error(`Unable to fetch map directory`, err);
        }
      }
    };
    loadMapDir();
  }, []);

  // settings panel and FAB
  const settingsPanel = (
    <SettingsPanel>
      <List>
        <CollapserItem label="Localization">
          <FormGroup row className={classes['VizControl']}>
            <FormControlLabel
              control={
                <Switch
                  checked={locShowMap}
                  onClick={() => setLocShowMap((s) => !s)}
                />
              }
              label={`Show Map`}
            />
            <Box flexGrow="1" />
            <Select
              value={chosenMap ?? mapName}
              onChange={(event) => setChosenMap(event.target.value as string)}
              autoWidth={true}
              margin="none"
            >
              {mapOptions.map((option) => (
                <MenuItem value={option.name} key={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>
          <FormGroup row className={classes['VizControl']}>
            <Button
              onClick={() =>
                setClickAction((a) =>
                  a === 'Localize' ? 'Default' : 'Localize'
                )
              }
              variant="outlined"
              color={clickAction === 'Localize' ? 'primary' : 'default'}
            >
              Set Pose
            </Button>
          </FormGroup>
        </CollapserItem>
        <CollapserItem label="Navigation">
          <FormGroup row className={classes['VizControl']}>
            <FormControlLabel
              control={
                <Switch
                  checked={locShowNavMap}
                  onClick={() => setLocShowNavMap((s) => !s)}
                />
              }
              label={`Show Nav Graph`}
            />
            <Box flexGrow="1" />
            <Button
              onClick={() =>
                setClickAction((a) => (a === 'SetNav' ? 'Default' : 'SetNav'))
              }
              variant="outlined"
              color={clickAction === 'SetNav' ? 'primary' : 'default'}
            >
              Set NavGoal
            </Button>
          </FormGroup>
        </CollapserItem>
        <CollapserItem label="Laser Scan">
          <FormControlLabel
            control={
              <Switch
                checked={scanShow}
                onClick={() => setScanShow((s) => !s)}
              />
            }
            label="Show laser scan"
          />
        </CollapserItem>
        <CollapserItem label="Visualization">
          <FormControlLabel
            control={
              <Switch
                checked={vizShowPoints}
                onClick={() => setVizShowPoints((s) => !s)}
              />
            }
            label="Show points"
          />
          <FormControlLabel
            control={
              <Switch
                checked={vizShowLines}
                onClick={() => setVizShowLines((s) => !s)}
              />
            }
            label="Show lines"
          />
        </CollapserItem>
      </List>
    </SettingsPanel>
  );

  // these viewers will be rendered into the <Canvas>
  // since <Canvas> uses the react-three-fiber reconciler, we must forward
  // any contexts manually :(
  const translation = new THREE.Matrix4().makeTranslation(x, y, 0);
  const rotation = new THREE.Matrix4().makeRotationZ(theta);
  const baseLink = translation.multiply(rotation);

  const viewers = (
    <WebSocketContext.Provider value={ws}>
      <Localization2DViewer
        namespace={props.namespace}
        topic="localization"
        mapColor={0x536dfe}
        mapName={chosenMap ?? mapName ?? 'EmptyMap'}
        mapVisible={locShowMap}
        x={x}
        y={y}
        theta={theta}
        poseColor={0x8ecc47}
        navGraphColor={0x5d6b75}
        navGraphVisible={locShowNavMap}
      />
      <LaserScanViewer
        enabled={enabled}
        namespace={props.namespace}
        topic="velodyne_2dscan"
        matrix={baseLink}
        color={0xff6e40}
        visible={scanShow}
      />
      <LaserScanViewer
        enabled={enabled}
        namespace={props.namespace}
        topic="obstacle_scan"
        matrix={baseLink}
        color={0xd121c5}
        visible={scanShow}
      />
      <VisualizationViewer
        enabled={enabled}
        namespace={props.namespace}
        topic="visualization"
        baseLinkMatrix={baseLink}
        pointsVisible={vizShowPoints}
        linesVisible={vizShowLines}
      />
    </WebSocketContext.Provider>
  );

  const handlePoseSet = (poseX: number, poseY: number, poseTheta: number) => {
    if (clickAction === 'Default') return;

    if (clickAction === 'SetNav') {
      if (ws?.connected) {
        ws.ws?.send(
          createPoseStampedMsg({
            namespace: props.namespace,
            topic: 'move_base_simple/goal',
            frame: 'map',
            x: poseX,
            y: poseY,
            theta: poseTheta,
          })
        );
      }
      setClickAction('Default');
    } else if (clickAction === 'Localize') {
      if (ws?.connected) {
        ws.ws?.send(
          createLocalization2DMsg({
            namespace: props.namespace,
            frame: 'map',
            map: chosenMap ?? mapName,
            x: poseX,
            y: poseY,
            theta: poseTheta,
          })
        );
        setChosenMap(undefined);
      }
      setClickAction('Default');
    }
  };

  // only close a snackbar if the close button was pressed
  const handleSnackbarClose = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason !== 'clickaway') setLocAlertOpen(false);
  };

  return (
    <>
      <Box
        position="absolute"
        zIndex="-1"
        bottom="0"
        top="0"
        left="0"
        right="0"
      >
        <Canvas
          orthographic={true}
          pixelRatio={window.devicePixelRatio}
          colorManagement={false}
          className={classes[clickAction]}
        >
          <CameraControls enabled={clickAction === 'Default'} />
          <PoseSetter
            enabled={clickAction !== 'Default'}
            callback={handlePoseSet}
          />
          {viewers}
        </Canvas>
      </Box>
      <Snackbar open={locAlertOpen} onClose={handleSnackbarClose}>
        <Alert severity="warning" onClose={handleSnackbarClose}>
          No localization available. Coordinate frames may be incorrect.
        </Alert>
      </Snackbar>
      {settingsPanel}
    </>
  );
}
