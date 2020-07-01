import React, { useEffect, useMemo, useState, useCallback } from "react";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";

export default function Localization2DViewer(props: {namespace: string, topic: string}) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);
  const [mapName, setMapName] = useState("GDC1");
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
      const json = await fetch(config.mapUrl(mapName)).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return Promise.reject(res);
        }
      }).catch((err) => {
        console.error(`Unable to load map ${mapName}`, err);
        return []; // If we can't load the map, make it empty
      });

      const posData = new Float32Array(json.flatMap((segment: any) => [
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
        color={0xFF00FF}
        linewidth={1}
        />
    </lineSegments>
    <mesh
      scale={[1, 0.2, 1]}
      rotation={[0, 0, theta]}
      position={[x, y, 0]}
      frustumCulled={false}
      >
      <boxBufferGeometry attach="geometry"/>
      <meshBasicMaterial attach="material"
        color={0x00FFFF}
        />
    </mesh>
  </>;
}
