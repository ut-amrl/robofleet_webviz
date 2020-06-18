import { Box, CircularProgress } from "@material-ui/core";
import React, { useEffect, useState, useMemo } from "react";
import { Canvas } from "react-three-fiber";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";
import CameraControls from "./CameraControls";

export default function Localization2DViewer(props: {namespace: string}) {
  const [loaded, setLoaded] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);
  const [mapName, setMapName] = useState("GDC1");
  const [linesData, setLinesData] = useState(new Float32Array(0));

  useRobofleetMsgListener(matchTopic(props.namespace, "localization"), (buf, match) => {
    setLoaded(true);
    const loc = fb.amrl_msgs.Localization2DMsg.getRootAsLocalization2DMsg(buf);
    const map = loc.map();
    if (map !== null)
      setMapName(map);
    setX(loc.pose()?.x() ?? 0);
    setY(loc.pose()?.y() ?? 0);
    setTheta(loc.pose()?.theta() ?? 0);
  });

  useEffect(() => {
    const loadMap = async () => {
      const data = await fetch(config.mapUrl(mapName));
      const json = await data.json();
      const posData = new Float32Array(json.flatMap((segment: any) => [
        segment.p0.x, segment.p0.y, 0,
        segment.p1.x, segment.p1.y, 0
      ]));
      setLinesData(posData);
    };
    loadMap();
  }, [mapName]);

  const canvas = <Canvas
    orthographic={true}
    pixelRatio={window.devicePixelRatio}
    >
    <CameraControls/>
    <Viewer {...props} linesData={linesData} x={x} y={y} theta={theta}/>
  </Canvas>;

  return <Box position="absolute" zIndex="-1" bottom="0" top="0" left="0" right="0">
    {loaded ? canvas : <CircularProgress variant="indeterminate"/>}
  </Box>;
}

function Viewer(props: any) {
  const linesPos = useMemo(() => (
    <bufferAttribute 
      attachObject={["attributes", "position"]}
      // can't use props; need to reconstruct to resize buffer
      args={[props.linesData, 3, false]}
      count={props.linesData.length / 3}
      onUpdate={(self) => {
        self.needsUpdate = true;
      }}
    />),
    [props.linesData]
  );

  return <>
    <lineSegments>
      <bufferGeometry attach="geometry">
        {linesPos}
      </bufferGeometry>
      <lineBasicMaterial attach="material"
        color={0xFF00FF}
        linewidth={1}
        />
    </lineSegments>
    <mesh
      scale={[12,2,1]}
      rotation={[0,0,props.theta]}
      position={[props.x,props.y,0]}
      frustumCulled={false}
      >
      <boxBufferGeometry attach="geometry"/>
      <meshBasicMaterial attach="material"
        color={0x00FFFF}
        />
    </mesh>
  </>;
}
