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
      let nav_graph_text = '';
      const res = await fetch(config.navGraphUrl(props.mapName));
      if (res.ok) {
        try {
          nav_graph_text = await res.text();
        } catch (err) {
          console.error(`Bad nav graph data for "${props.mapName}"`, err);
          return;
        }
      }

      interface graphNode {
        id: number;
        x: number;
        y: number;
        neighbors: Array<number>;
      }

      let nodes = new Map<number, graphNode>();

      nav_graph_text.split('\n').map((nodeText) => {
        let node_info = nodeText.split(', ');
        let neighbors = [];
        for (
          let neighbor_idx = 0;
          neighbor_idx < parseInt(node_info[3], 10);
          neighbor_idx++
        ) {
          neighbors.push(parseInt(node_info[neighbor_idx + 4]));
        }
        let node_id = parseInt(node_info[0], 10);
        nodes.set(node_id, {
          id: node_id,
          x: parseFloat(node_info[1]),
          y: parseFloat(node_info[2]),
          neighbors: neighbors,
        } as graphNode);
      });

      let edges: number[][] = [];

      for (let node_id of nodes.keys()) {
        let node = nodes.get(node_id)!;
        node.neighbors.forEach((neigbhor: number) => {
          if (neigbhor > node_id) {
            edges.push([
              node.x,
              node.y,
              nodes.get(neigbhor)!.x,
              nodes.get(neigbhor)!.y,
            ]);
          }
        });
      }

      const edgeSegmentsData = new Float32Array(
        edges.flatMap((edge) => [edge[0], edge[1], 0, edge[2], edge[3], 0])
      );

      setNavGraphLinesData(edgeSegmentsData);
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
