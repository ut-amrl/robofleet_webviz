import React, { useState, useCallback, useMemo, useEffect } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { fb } from "../schema";
import THREE, { BufferAttribute, Color, Vector4, Vector3 } from "three";

export function ColoredLinesViewer(props: {msg: fb.amrl_msgs.VisualizationMsg}) {
  const { msg } = props;
  const [linesLength, setLinesLength] = useState(0);
  const [posArray, setPosArray] = useState(new Float32Array());
  const [posAttr, setPosAttr] = useState<BufferAttribute>();
  const [colArray, setColArray] = useState(new Float32Array());
  const [colAttr, setColAttr] = useState<BufferAttribute>();

  // grow buffers as necessary
  useEffect(() => {
    const newLength = msg.linesLength();
    if (newLength <= linesLength)
      return;

    setPosArray(new Float32Array(newLength * 6));
    setPosAttr(new BufferAttribute(posArray, 3, false));

    setColArray(new Float32Array(newLength * 2));
    setColAttr(new BufferAttribute(colArray, 3, false));
  }, [msg.linesLength()]);

  // update buffer contents
  useEffect(() => {
    if (!posAttr || !colAttr)
      return;
    const a = new Vector3();
    const b = new Vector3();
    const color = new Color();

    for (let i = 0; i < msg.linesLength(); ++i) {
      const l = msg.lines(i)!;
      const index = i * 2; // two vertices per line segment
      
      // both vertices get the same color
      color.set(l.color());
      colAttr.setXYZ(index + 0, color.r, color.g, color.b);
      colAttr.setXYZ(index + 1, color.r, color.g, color.b);

      a.set(l.p0()!.x(), l.p0()!.y(), 0);
      b.set(l.p1()!.x(), l.p1()!.y(), 0);
      posAttr.setXYZ(index + 0, a.x, a.y, a.z);
      posAttr.setXYZ(index + 1, b.x, b.y, b.z);
    }
    colAttr.needsUpdate = true;
    posAttr.needsUpdate = true;
  }, [msg, posAttr, colAttr]);

  return <lineSegments
    frustumCulled={false}
  >
    <bufferGeometry attach="geometry"
      attributes-position={posAttr}
      attributes-color={colAttr}
      drawRange={{start: 0, count: msg.linesLength()}}
    />
    <lineBasicMaterial attach="material"
      vertexColors={true}
    />
  </lineSegments>; 
}

export default function VisualizationViewer(props: {namespace: string, topic: string}) {
  const { namespace, topic } = props;
  const [msg, setMsg] = useState<fb.amrl_msgs.VisualizationMsg | null>(null);

  useRobofleetMsgListener(matchTopic(namespace, topic), useCallback((buf, match) => {
    const msg = fb.amrl_msgs.VisualizationMsg.getRootAsVisualizationMsg(buf);
    setMsg(msg);
  }, []));

  if (!msg)
    return <></>;

  return <>
    <ColoredLinesViewer msg={msg}/>
  </>;
}
