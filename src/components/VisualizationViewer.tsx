import React, { useCallback, useMemo, useState } from "react";
import { Color, Matrix4 } from "three";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";

export function ColoredLinesViewer(props: 
    {msg: fb.amrl_msgs.VisualizationMsg, matrix?: Matrix4}) {
  const { msg } = props;

  const length = msg.linesLength();

  const positionAttrib = useMemo(() => {
    const data = new Float32Array(length * 2 * 3);
    for (let i = 0; i < msg.linesLength(); ++i) {
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

    return <bufferAttribute
      attachObject={["attributes", "position"]}
      args={[data, 3, false]}
      count={length * 2}
      onUpdate={(self) => self.needsUpdate = true}
    />;
  }, [msg]);

  const colorAttrib = useMemo(() => {
    const data = new Float32Array(length * 2 * 3);
    const color = new Color();
    for (let i = 0; i < msg.linesLength(); ++i) {
      const index = i * 2 * 3;
      const l = msg.lines(i)!;

      // same color for both vertices
      color.set(l.color());
      data[index + 0] = data[index + 3] = color.r;
      data[index + 1] = data[index + 4] = color.g;
      data[index + 2] = data[index + 5] = color.b;
    }

    return <bufferAttribute
      attachObject={["attributes", "color"]}
      args={[data, 3, false]}
      count={length * 2}
      onUpdate={(self) => self.needsUpdate = true}
    />;
  }, [msg]);

  const I = new Matrix4();
  return <lineSegments
    frustumCulled={false}
    matrixAutoUpdate={false}
    matrixWorldNeedsUpdate={true}
    matrix={props.matrix ?? I}
  >
    <bufferGeometry attach="geometry">
      {positionAttrib}
      {colorAttrib}
    </bufferGeometry>
    <lineBasicMaterial attach="material"
      vertexColors={true}
    />
  </lineSegments>; 
}

export default function VisualizationViewer(props: {namespace: string, topic: string, baseLinkMatrix: Matrix4}) {
  const { namespace, topic, baseLinkMatrix } = props;
  const [mapMsg, setMapMsg] = useState<fb.amrl_msgs.VisualizationMsg | null>(null);
  const [baseLinkMsg, setBaseLinkMsg] = useState<fb.amrl_msgs.VisualizationMsg | null>(null);

  useRobofleetMsgListener(matchTopic(namespace, topic), useCallback((buf, match) => {
    const msg = fb.amrl_msgs.VisualizationMsg.getRootAsVisualizationMsg(buf);
    const frame = msg.header()?.frameId();
    if (frame === "map") {
      setMapMsg(msg);
    }
    if (frame === "base_link") {
      setBaseLinkMsg(msg);
    }
  }, []));

  return <>
    {mapMsg && <ColoredLinesViewer msg={mapMsg}/>}
    {baseLinkMsg && <ColoredLinesViewer msg={baseLinkMsg} matrix={baseLinkMatrix}/>}
  </>;
}
