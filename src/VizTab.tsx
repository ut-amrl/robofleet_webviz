import { Box } from "@material-ui/core";
import React, { useContext } from "react";
import { Canvas } from "react-three-fiber";
import CameraControls from "./components/CameraControls";
import Localization2DViewer from "./components/Localization2DViewer";
import WebSocketContext from "./contexts/WebSocketContext";
import LaserScanViewer from "./components/LaserScanViewer";

export default function VizTab(props: {namespace: string}) {
  const ws = useContext(WebSocketContext);

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
        color={0xFFAA00}  
      />
  </WebSocketContext.Provider>;

  return <Box position="absolute" zIndex="-1" bottom="0" top="0" left="0" right="0">
    <Canvas
      orthographic={true}
      pixelRatio={window.devicePixelRatio}
    >
      <CameraControls/>
      {viewers}
    </Canvas>
  </Box>;
}
