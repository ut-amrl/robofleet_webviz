import React, { useCallback, useMemo, useState } from 'react';
import { Matrix4 } from 'three';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { fb } from '../schema';
import { matchTopic } from '../util';

export default function LaserScanViewer(props: {
  enabled: boolean;
  namespace: string;
  topic: string;
  color: any;
  matrix?: Matrix4;
  pointSize?: number;
  visible?: boolean;
}) {
  const { enabled } = props;
  const [pointsData, setPointsData] = useState(new Float32Array(0));

  useRobofleetMsgListener(
    matchTopic(props.namespace, props.topic),
    useCallback((buf, match) => {
      const scan = fb.sensor_msgs.LaserScan.getRootAsLaserScan(buf);
      const posData = new Float32Array(scan.rangesLength() * 3);
      for (let i = 0; i < posData.length; ++i) {
        const idx = i * 3;
        const range = scan.ranges(i) ?? 0;
        posData[idx + 0] =
          Math.cos(scan.angleMin() + i * scan.angleIncrement()) * range;
        posData[idx + 1] =
          Math.sin(scan.angleMin() + i * scan.angleIncrement()) * range;
        posData[idx + 2] = 0;
      }
      setPointsData(posData);
    }, []),
    { enabled }
  );

  const pointsPosAttrib = useMemo(
    () => (
      <bufferAttribute
        attachObject={['attributes', 'position']}
        // can't use props; need to reconstruct to resize buffer
        args={[pointsData, 3, false]}
        count={pointsData.length / 3}
        onUpdate={(self) => {
          self.needsUpdate = true;
        }}
      />
    ),
    [pointsData]
  );

  const I = useMemo(() => new Matrix4(), []);

  return (
    <>
      <points
        frustumCulled={false}
        matrixAutoUpdate={false}
        matrixWorldNeedsUpdate={true}
        matrix={props.matrix ?? I}
        visible={props.visible ?? true}
      >
        <bufferGeometry attach="geometry">{pointsPosAttrib}</bufferGeometry>
        <pointsMaterial
          attach="material"
          color={props.color}
          size={props.pointSize ?? 4}
        />
      </points>
    </>
  );
}
