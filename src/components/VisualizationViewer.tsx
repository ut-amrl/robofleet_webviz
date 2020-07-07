import React, { useCallback, useState } from 'react';
import { Matrix4 } from 'three';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { fb } from '../schema';
import { matchTopic } from '../util';
import ColoredLinesViewer from './ColoredLinesViewer';
import ColoredPointsViewer from './ColoredPointsViewer';

export default function VisualizationViewer(props: {
  namespace: string;
  topic: string;
  baseLinkMatrix: Matrix4;
  pointsVisible?: boolean;
  linesVisible?: boolean;
}) {
  const { namespace, topic, baseLinkMatrix } = props;
  const [mapMsg, setMapMsg] = useState<fb.amrl_msgs.VisualizationMsg | null>(
    null
  );
  const [
    baseLinkMsg,
    setBaseLinkMsg,
  ] = useState<fb.amrl_msgs.VisualizationMsg | null>(null);

  useRobofleetMsgListener(
    matchTopic(namespace, topic),
    useCallback((buf, match) => {
      const msg = fb.amrl_msgs.VisualizationMsg.getRootAsVisualizationMsg(buf);
      const frame = msg.header()?.frameId();
      if (frame === 'map') {
        setMapMsg(msg);
      }
      if (frame === 'base_link') {
        setBaseLinkMsg(msg);
      }
    }, [])
  );

  return (
    <>
      {mapMsg && (
        <ColoredLinesViewer msg={mapMsg} visible={props.linesVisible} />
      )}
      {baseLinkMsg && (
        <ColoredLinesViewer
          msg={baseLinkMsg}
          matrix={baseLinkMatrix}
          visible={props.linesVisible}
        />
      )}
      {mapMsg && (
        <ColoredPointsViewer msg={mapMsg} visible={props.pointsVisible} />
      )}
      {baseLinkMsg && (
        <ColoredPointsViewer
          msg={baseLinkMsg}
          matrix={baseLinkMatrix}
          visible={props.pointsVisible}
        />
      )}
    </>
  );
}
