import { CircularProgress, Grid, Paper } from "@material-ui/core";
import React, { useEffect, useState, useRef } from "react";
import { Canvas, extend, ReactThreeFiber, useThree, useFrame } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";
import * as THREE from "three";

// add OrbitControls as external three.js thing
extend({OrbitControls});
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

export default function Localization2DViewer(props: {namespace: string}) {
  const [loaded, setLoaded] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);
  const [mapName, setMapName] = useState("GDC1");
  const [linesData, setLinesData] = useState(new Float32Array(50000));

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

  return <>
    {!loaded && <CircularProgress variant="indeterminate"/>}
    <Grid item component={Paper} xs={4} style={{height: "200px"}}>
      <Canvas
        orthographic={true}
        pixelRatio={window.devicePixelRatio}
        >
        <Controls
          target={[0, 0, 0]}
          enableRotate={false}
          enableZoom={true}
          enableDamping
          dampingFactor={0.1}
          screenSpacePanning
          mouseButtons={{
            LEFT: THREE.MOUSE.RIGHT,
            MIDDLE: THREE.MOUSE.MIDDLE,
            RIGHT: THREE.MOUSE.LEFT 
          }}
        />
        <Viewer {...props} linesData={linesData} x={x} y={y} theta={theta}/>
      </Canvas>
    </Grid>
  </>;
}

function Controls(props: any) {
  // https://codesandbox.io/s/r3f-orbit-controls-un2oh?from-embed=&file=/src/index.js
  const ref = useRef<any>();
  const { camera, gl } = useThree();
  useFrame(() => ref.current && ref.current.update());
  return <orbitControls
    ref={ref}
    args={[camera, gl.domElement]}
    {...props}
  />;
}

function Viewer(props: any) {
  console.log(props.mapName);
  return <>
    <lineSegments>
      <bufferGeometry attach="geometry">
        <bufferAttribute 
          attachObject={["attributes", "position"]}
          itemSize={3}
          count={props.linesData.length / 3}
          array={props.linesData}
          onUpdate={(self) => {
            self.needsUpdate = true;
          }}
          />
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
