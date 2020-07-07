import React from 'react';
import { Overwrite, ReactThreeFiber } from 'react-three-fiber';
import { MeshBasicMaterial, MeshBasicMaterialParameters, Color } from 'three';

type MaterialProps = Overwrite<
  Partial<MeshBasicMaterial>,
  ReactThreeFiber.NodeProps<MeshBasicMaterial, [MeshBasicMaterialParameters]>
>;

/**
 * A 3D arrow positioned with its tail at (x, y) and its tip pointing in
 * direction theta. Occupies a 1x1x1 volume.
 */
export default function Pose(props: {
  x: number;
  y: number;
  theta: number;
  scale?: [number, number, number];
  materialProps?: MaterialProps;
}) {
  const materialProps: MaterialProps = props.materialProps ?? {
    wireframe: true,
    color: new Color(0x8ecc47),
  };

  return (
    <group
      rotation={[0, 0, props.theta]}
      position={[props.x, props.y, 0]}
      scale={props.scale ?? [1, 1, 1]}
    >
      <mesh scale={[0.05, 0.05, 0.05]}>
        <boxGeometry attach="geometry" />
        <meshBasicMaterial attach="material" color={0xff0000} />
      </mesh>
      <group position={[0.75, 0, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} scale={[0.5, 0.5, 0.5]}>
          <coneBufferGeometry attach="geometry" />
          <meshBasicMaterial attach="material" {...materialProps} />
        </mesh>
      </group>
      <group position={[0.25, 0, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]} scale={[0.2, 0.5, 0.2]}>
          <cylinderBufferGeometry attach="geometry" />
          <meshBasicMaterial attach="material" {...materialProps} />
        </mesh>
      </group>
    </group>
  );
}
