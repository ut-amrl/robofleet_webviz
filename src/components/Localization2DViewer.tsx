import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Color } from "three";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";
import Pose from "./Pose";

export default function Localization2DViewer(props: 
    {namespace: string, topic: string, mapColor: number, poseColor: number}) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);
  const [mapName, setMapName] = useState("");
  const [linesData, setLinesData] = useState(new Float32Array(0));

  useRobofleetMsgListener(matchTopic(props.namespace, props.topic), useCallback((buf, match) => {
    const loc = fb.amrl_msgs.Localization2DMsg.getRootAsLocalization2DMsg(buf);
    const map = loc.map();
    if (map !== null)
      setMapName(map);
    setX(loc.pose()?.x() ?? 0);
    setY(loc.pose()?.y() ?? 0);
    setTheta(loc.pose()?.theta() ?? 0);
  }, []));

  useEffect(() => {
    const loadMap = async () => {
      let segments = [];
      if (mapName !== "") {
        const res = await fetch(config.mapUrl(mapName));
        if (res.ok) {
          try {
            segments = await res.json();
          } catch (err) {
            console.error(`Bad map data for "${mapName}"`, err);
          }
        }
      }

      const posData = new Float32Array(segments.flatMap((segment: any) => [
        segment.p0.x, segment.p0.y, 0,
        segment.p1.x, segment.p1.y, 0
      ]));
      setLinesData(posData);
    };
    loadMap();
  }, [mapName]);

  const linesPosAttrib = useMemo(() => (
    <bufferAttribute 
      attachObject={["attributes", "position"]}
      // can't use props; need to reconstruct to resize buffer
      args={[linesData, 3, false]}
      count={linesData.length / 3}
      onUpdate={(self) => {
        self.needsUpdate = true;
      }}
    />),
    [linesData]
  );

  return <>
    <lineSegments
      frustumCulled={false}
      >
      <bufferGeometry attach="geometry">
        {linesPosAttrib}
      </bufferGeometry>
      <lineBasicMaterial attach="material"
        color={props.mapColor}
        linewidth={1}
        />
    </lineSegments>
    <Pose 
      x={x} 
      y={y} 
      theta={theta}
      materialProps={{
        color: new Color(props.poseColor),
        wireframe: true
      }}
    />
  </>;
}
