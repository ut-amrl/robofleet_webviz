import React, { useMemo } from 'react';
import { Color, Matrix4 } from 'three';
import { fb } from '../schema';

export default function ColoredLinesViewer(props: {
  msg: fb.amrl_msgs.VisualizationMsg;
  matrix?: Matrix4;
  lineWidth?: number;
  visible?: boolean;
}) {
  const { msg } = props;

  const length = msg.linesLength();

  const positionAttrib = useMemo(() => {
    const data = new Float32Array(length * 2 * 3);
    for (let i = 0; i < length; ++i) {
      const index = i * 2 * 3;
      const l = msg.lines(i)!;

      // p0
      data[index + 0] = l.p0()!.x();
      data[index + 1] = l.p0()!.y();
      data[index + 2] = 0;

      // p1
      data[index + 3] = l.p1()!.x();
      data[index + 4] = l.p1()!.y();
      data[index + 5] = 0;
    }

    return (
      <bufferAttribute
        attachObject={['attributes', 'position']}
        args={[data, 3, false]}
        count={length * 2}
        onUpdate={(self) => (self.needsUpdate = true)}
      />
    );
  }, [msg, length]);

  const colorAttrib = useMemo(() => {
    const data = new Float32Array(length * 2 * 3);
    const color = new Color();
    for (let i = 0; i < length; ++i) {
      const index = i * 2 * 3;
      const l = msg.lines(i)!;

      // same color for both vertices
      color.set(l.color());
      data[index + 0] = data[index + 3] = color.r;
      data[index + 1] = data[index + 4] = color.g;
      data[index + 2] = data[index + 5] = color.b;
    }

    return (
      <bufferAttribute
        attachObject={['attributes', 'color']}
        args={[data, 3, false]}
        count={length * 2}
      />
    );
  }, [msg, length]);

  const I = new Matrix4();
  return (
    <lineSegments
      frustumCulled={false}
      matrixAutoUpdate={false}
      matrixWorldNeedsUpdate={true}
      matrix={props.matrix ?? I}
      visible={props.visible ?? true}
    >
      <bufferGeometry>
        {positionAttrib}
        {colorAttrib}
      </bufferGeometry>
      <lineBasicMaterial vertexColors={true} linewidth={props.lineWidth ?? 3} />
    </lineSegments>
  );
}
