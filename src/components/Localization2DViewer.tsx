import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
import{ Matrix4, Vector3, Quaternion, Euler, Color, Vector2 } from "three";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";
import Pose from "./Pose";

export default function Localization2DViewer(props: 
    {namespace: string, topic: string, mapColor: number, mapVisible?: boolean, mapName: string, x: number, y: number, theta:number, poseColor: number}) {
  const [linesData, setLinesData] = useState(new Float32Array(0));

  useEffect(() => {
    const loadMap = async () => {
      let segments = [];
      const res = await fetch(config.mapUrl(props.mapName));
      if (res.ok) {
        try {
          segments = await res.json();
        } catch (err) {
          console.error(`Bad map data for "${props.mapName}"`, err);
        }
      }

      const posData = new Float32Array(segments.flatMap((segment: any) => [
        segment.p0.x, segment.p0.y, 0,
        segment.p1.x, segment.p1.y, 0
      ]));
      setLinesData(posData);
    };
    loadMap();
  }, [props.mapName]);

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
      visible={props.mapVisible ?? true}
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
      x={props.x}
      y={props.y}
      theta={props.theta}
      materialProps={{
        color: new Color(props.poseColor),
        wireframe: true
      }}
    />
  </>;
}
