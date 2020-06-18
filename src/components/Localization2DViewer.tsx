import React, { useState, useRef } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { Grid } from "@material-ui/core";
import { Canvas, useFrame } from "react-three-fiber";
import { Mesh, Geometry, Material } from "three";

function Viewer(props: any) {
  const { namespace } = props;
  const [loaded, setLoaded] = useState(false);
  const meshRef: any = useRef();

  useRobofleetMsgListener(matchTopic(namespace, "localization"), (buf, match) => {
    setLoaded(true);
  });

  useFrame(() => meshRef.current.rotation.x += 0.01);

  return <>
    <ambientLight/>
    <mesh ref={meshRef}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color={"hotpink"} />
    </mesh>
  </>;
}

export default function Localization2DViewer(props: {namespace: string}) {
  return <Grid xs={12}>
    <Canvas>
      <Viewer {...props}/>
    </Canvas>
  </Grid>; 
}
