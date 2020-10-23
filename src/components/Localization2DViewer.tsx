import React, { useEffect, useMemo, useState } from 'react';
import { Color } from 'three';
import config from '../config';
import Pose from './Pose';

export default function Localization2DViewer(props: {
  namespace: string;
  topic: string;
  mapColor: number;
  mapVisible?: boolean;
  mapName: string;
  x: number;
  y: number;
  theta: number;
  poseColor: number;
  navGraphColor: number;
  navGraphVisible?: boolean;
}) {
  const [linesData, setLinesData] = useState(new Float32Array(0));
  const [navGraphLinesData, setNavGraphLinesData] = useState(
    new Float32Array(0)
  );

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

      const posData = new Float32Array(
        segments.flatMap((segment: any) => [
          segment.p0.x,
          segment.p0.y,
          0,
          segment.p1.x,
          segment.p1.y,
          0,
        ])
      );
      setLinesData(posData);
    };

    const loadNavGraph = async () => {
      let nav_graph_text: any;
      const res = await fetch(config.navGraphUrl(props.mapName));
      if (res.ok) {
        try {
          nav_graph_text = await res.json();
        } catch (err) {
          console.error(`Bad nav graph data for "${props.mapName}"`, err);
          setNavGraphLinesData(new Float32Array(0));
          return;
        }

        let nodeMap = new Map();
        for (let node of nav_graph_text.nodes) {
          console.log(node);
          nodeMap.set(node.id, node);
        }

        // Set up the edges for drawing
        const edgeSegmentsData = new Float32Array(
          nav_graph_text.edges.flatMap((edge: any) => [
            nodeMap.get(edge.s0_id).loc.x,
            nodeMap.get(edge.s0_id).loc.y,
            0,
            nodeMap.get(edge.s1_id).loc.x,
            nodeMap.get(edge.s1_id).loc.y,
            0,
          ])
        );

        setNavGraphLinesData(edgeSegmentsData);
      } else {
        setNavGraphLinesData(new Float32Array(0));
      }
    };
    loadMap();
    loadNavGraph();
  }, [props.mapName]);

  const linesPosAttrib = useMemo(
    () => (
      <bufferAttribute
        attachObject={['attributes', 'position']}
        // can't use props; need to reconstruct to resize buffer
        args={[linesData, 3, false]}
        count={linesData.length / 3}
        onUpdate={(self) => {
          self.needsUpdate = true;
        }}
      />
    ),
    [linesData]
  );

  const navGraphLinesPosAttrib = useMemo(
    () => (
      <bufferAttribute
        attachObject={['attributes', 'position']}
        // can't use props; need to reconstruct to resize buffer
        args={[navGraphLinesData, 3, false]}
        count={navGraphLinesData.length / 3}
        onUpdate={(self) => {
          self.needsUpdate = true;
        }}
      />
    ),
    [navGraphLinesData]
  );

  return (
    <>
      <lineSegments frustumCulled={false} visible={props.mapVisible ?? true}>
        <bufferGeometry attach="geometry">{linesPosAttrib}</bufferGeometry>
        <lineBasicMaterial
          attach="material"
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
          wireframe: true,
        }}
      />
      <lineSegments
        frustumCulled={false}
        visible={props.navGraphVisible ?? true}
      >
        <bufferGeometry attach="geometry">
          {navGraphLinesPosAttrib}
        </bufferGeometry>
        <lineBasicMaterial
          attach="material"
          color={props.navGraphColor}
          linewidth={2}
        />
      </lineSegments>
    </>
  );
}
