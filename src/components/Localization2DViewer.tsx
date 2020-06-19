import React, { useEffect, useMemo, useState } from "react";
import config from "../config";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { fb } from "../schema";
import { matchTopic } from "../util";

export default function Localization2DViewer(props: {namespace: string}) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [theta, setTheta] = useState(0);
  const [mapName, setMapName] = useState("GDC1");
  const [linesData, setLinesData] = useState(new Float32Array(0));

  useRobofleetMsgListener(matchTopic(props.namespace, "localization"), (buf, match) => {
    const loc = fb.amrl_msgs.Localization2DMsg.getRootAsLocalization2DMsg(buf);
    const map = loc.map();
    if (map !== null)
      setMapName(map);
    setX(loc.pose()?.x() ?? 0);
    setY(loc.pose()?.y() ?? 0);
    setTheta(loc.pose()?.theta() ?? 0);
  });

  useEffect(() => {
    const loadMap = async () => {
      const data = await fetch(config.mapUrl(mapName));
      const json = await data.json();
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
      scale={[12, 2, 1]}
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