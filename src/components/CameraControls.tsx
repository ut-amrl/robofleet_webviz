import React, { useRef } from "react";
import { extend, ReactThreeFiber, useFrame, useThree } from "react-three-fiber"; // eslint-disable-line
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// add OrbitControls as external three.js thing
extend({OrbitControls});
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

export default function CameraControls(props: any) {
  // https://codesandbox.io/s/r3f-orbit-controls-un2oh?from-embed=&file=/src/index.js
  const ref = useRef<any>();
  const { camera, gl } = useThree();
  useFrame(() => ref.current && ref.current.update());
  return <orbitControls
    ref={ref}
    args={[camera, gl.domElement]}

    target={[0, 0, 0]}
    enableRotate={true}
    enableZoom={true}
    enableDamping
    dampingFactor={0.08}
    screenSpacePanning
    mouseButtons={{
      LEFT: THREE.MOUSE.RIGHT,
      MIDDLE: THREE.MOUSE.MIDDLE,
      RIGHT: THREE.MOUSE.LEFT 
    }}
    {...props}
  />;
}
