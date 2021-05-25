import React, { useCallback, useState } from 'react';
import { Matrix4 } from 'three';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { fb } from '../schema';
import { matchTopic } from '../util';
import ColoredLinesViewer from './ColoredLinesViewer';
import ColoredPointsViewer from './ColoredPointsViewer';

type MsgMap = {
  [key: string]: fb.amrl_msgs.VisualizationMsg;
};

export default function VisualizationViewer(props: {
  enabled: boolean;
  namespace: string;
  topic: string;
  baseLinkMatrix: Matrix4;
  pointsVisible?: boolean;
  linesVisible?: boolean;
}) {
  const { enabled, namespace, topic, baseLinkMatrix } = props;
  const [mapMsgMap, setMapMsgMap] = useState<MsgMap | null>(null);
  const [baseLinkMsgMap, setBaseLinkMsgMap] = useState<MsgMap | null>(null);

  useRobofleetMsgListener(
    matchTopic(namespace, topic),
    useCallback(
      (buf, match) => {
        const msg = fb.amrl_msgs.VisualizationMsg.getRootAsVisualizationMsg(
          buf
        );
        const frame = msg.header()?.frameId();
        const msgNamespace = msg.ns()!;
        if (frame === 'map') {
          setMapMsgMap({
            ...mapMsgMap,
            [msgNamespace]: msg,
          });
        }
        if (frame === 'base_link') {
          setBaseLinkMsgMap({
            ...baseLinkMsgMap,
            [msgNamespace]: msg,
          });
        }
      },
      [baseLinkMsgMap, mapMsgMap]
    ),
    { enabled }
  );

  const viewers: Array<JSX.Element> = [];
  for (const ns in mapMsgMap) {
    viewers.push(
      <ColoredLinesViewer msg={mapMsgMap[ns]} visible={props.linesVisible} />
    );
    viewers.push(
      <ColoredPointsViewer msg={mapMsgMap[ns]} visible={props.pointsVisible} />
    );
  }

  const baseLinkViewers = [];
  for (const ns in baseLinkMsgMap) {
    baseLinkViewers.push(
      <ColoredLinesViewer
        msg={baseLinkMsgMap[ns]}
        matrix={baseLinkMatrix}
        visible={props.linesVisible}
      />
    );
    baseLinkViewers.push(
      <ColoredPointsViewer
        msg={baseLinkMsgMap[ns]}
        matrix={baseLinkMatrix}
        visible={props.pointsVisible}
      />
    );
  }

  return (
    <>
      {viewers}
      {baseLinkViewers}
    </>
  );
}
