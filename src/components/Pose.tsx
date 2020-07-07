import React from "react";
import { Overwrite, ReactThreeFiber } from "react-three-fiber";
import { MeshBasicMaterial, MeshBasicMaterialParameters, Color, Matrix4, Quaternion, Vector3, Euler } from "three";

type MaterialProps = Overwrite<Partial<MeshBasicMaterial>, ReactThreeFiber.NodeProps<MeshBasicMaterial, [MeshBasicMaterialParameters]>>;

/**
 * A 3D arrow positioned at baseLink. Occupies a 1x1x1 volume. 
 */
export default function Pose(props: { baseLink: Matrix4, materialProps?: MaterialProps}) {
  
  const materialProps: MaterialProps = props.materialProps ?? {
    wireframe: true,
    color: new Color(0x8ECC47)
  };

  let pos = new Vector3();
  let rot = new Quaternion();
  let scale = new Vector3(1, 1, 1);
  props.baseLink.decompose(pos, rot, scale);
  let rotEuler = new Euler();
  rotEuler.setFromQuaternion(rot);
  
  return <group
    rotation={rotEuler}
    position={pos}
    scale={scale}
  >
    <mesh scale={[0.05, 0.05, 0.05]}>
      <boxGeometry attach="geometry"/>
      <meshBasicMaterial attach="material" color={0xFF0000}/>
    </mesh>
    <group position={[0.75, 0, 0]}>
      <mesh
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.5, 0.5, 0.5]}
      >
        <coneBufferGeometry attach="geometry"/>
        <meshBasicMaterial attach="material"
          {...materialProps}
        />
      </mesh>
    </group>
    <group position={[0.25, 0, 0]}>
      <mesh
        rotation={[0, 0, -Math.PI / 2]}
        scale={[0.2, 0.5, 0.2]}
      >
        <cylinderBufferGeometry attach="geometry"/>
        <meshBasicMaterial attach="material"
          {...materialProps}
        />
      </mesh>
    </group>
  </group>;
}
