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
      let nav_graph_nodes = [];
      const res = await fetch(config.navGraphUrl(props.mapName));
      if (res.ok) {
        try {
          console.log(await res);
          nav_graph_nodes = await res.json(); // TODO this won't work - need to get text file lines
        } catch (err) {
          console.error(`Bad nav graph data for "${props.mapName}"`, err);
        }
      }

      // TODO parse this from file (should be list of lists,
      // with big list containing all edges and inner lists containing the start node and end node index of the edge)
      // Sort indices before putting them in and then dedupe if edge is already there
      const edgeData = [
        [0, 1],
        [1, 2],
      ];

      // TODO parse this from file
      // Should be dictionary linking node id (I'm assuming this is the first entry in a line of the navigation graph file)
      // to the position of the node
      const nodePosData = {
        0: { x: 131.42, y: -245.77 },
        1: { x: 131.76, y: -252.18 },
        2: { x: 84, y: -255.22 },
      };

      // Create list of line segments based on the edge data
      // Note: I'm assuming the 3rd and 6th entries are supposed to be 0 based on the map visualization, but I wasn't exactly sure where these were coming from (z?)
      const edgeSegmentsData = new Float32Array( // TODO this doesn't work. There's some issue with the typing and accessing the node pos data
        edgeData.flatMap((edge) => [
          nodePosData[edge[0]].x,
          nodePosData[edge[0]].y,
          0,
          nodePosData[edge[1]].x,
          nodePosData[edge[1]].y,
          0,
        ])
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
