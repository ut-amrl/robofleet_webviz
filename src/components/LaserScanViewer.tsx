import React, { useEffect, useMemo, useState } from "react";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";
import { Matrix4 } from "three";

export default function LaserScanViewer(props: {namespace: string, topic: string, color: any, matrix?: Matrix4, pointSize?: number}) {
  const [pointsData, setPointsData] = useState(new Float32Array(0));

  useRobofleetMsgListener(matchTopic(props.namespace, props.topic), (buf, match) => {
    const scan = fb.sensor_msgs.LaserScan.getRootAsLaserScan(buf);
    const posData = new Float32Array(scan.rangesLength() * 3);
    for (let i = 0; i < posData.length; ++i) {
      const idx = i * 3;
      const range = scan.ranges(i) ?? 0;
      posData[idx + 0] = Math.cos(scan.angleMin() + i * scan.angleIncrement()) * range;
      posData[idx + 1] = Math.sin(scan.angleMin() + i * scan.angleIncrement()) * range;
      posData[idx + 2] = 0;
    }
    setPointsData(posData);
  });

  const pointsPosAttrib = useMemo(() => (
    <bufferAttribute 
      attachObject={["attributes", "position"]}
      // can't use props; need to reconstruct to resize buffer
      args={[pointsData, 3, false]}
      count={pointsData.length / 3}
      onUpdate={(self) => {
        self.needsUpdate = true;
      }}
    />),
    [pointsData]
  );

  const I = useMemo(() => new Matrix4(), []);

  return <>
    <points
      frustumCulled={false}
      matrixAutoUpdate={false}
      matrixWorldNeedsUpdate={true}
      matrix={props.matrix ?? I}
      >
      <bufferGeometry attach="geometry">
        {pointsPosAttrib}
      </bufferGeometry>
      <pointsMaterial attach="material"
        color={props.color}
        size={props.pointSize ?? 4}
        />
    </points>
  </>;
}
