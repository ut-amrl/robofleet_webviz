import React, { useMemo } from "react";
import { Color, Matrix4 } from "three";
import { fb } from "../schema";

export default function ColoredPointsViewer(props: {msg: fb.amrl_msgs.VisualizationMsg, matrix?: Matrix4, 
    pointSize?: number, visible?: boolean}) {
  const { msg } = props;

  const length = msg.pointsLength();

  const positionAttrib = useMemo(() => {
    const data = new Float32Array(length * 3);
    for (let i = 0; i < length; ++i) {
      const index = i * 3;
      const p = msg.points(i)!;

      data[index + 0] = p.point()!.x();
      data[index + 1] = p.point()!.y();
      data[index + 2] = 0;
    }

    return <bufferAttribute
      attachObject={["attributes", "position"]}
      args={[data, 3, false]}
      count={length}
      onUpdate={(self) => self.needsUpdate = true}
    />;
  }, [msg, length]);

  const colorAttrib = useMemo(() => {
    const data = new Float32Array(length * 3);
    const color = new Color();
    for (let i = 0; i < length; ++i) {
      const index = i * 3;
      const p = msg.points(i)!;

      // same color for both vertices
      color.set(p.color());
      data[index + 0] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
    }

    return <bufferAttribute
      attachObject={["attributes", "color"]}
      args={[data, 3, false]}
      count={length}
    />;
  }, [msg, length]);

  const I = new Matrix4();
  return <points
    frustumCulled={false}
    matrixAutoUpdate={false}
    matrixWorldNeedsUpdate={true}
    matrix={props.matrix ?? I}
    visible={props.visible ?? true}
  >
    <bufferGeometry attach="geometry">
      {positionAttrib}
      {colorAttrib}
    </bufferGeometry>
    <pointsMaterial attach="material"
      vertexColors={true}
      size={props.pointSize ?? 4}
    />
  </points>; 
}
