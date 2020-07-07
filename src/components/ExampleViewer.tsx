import React, { useState, useCallback } from 'react';
import useRobofleetMsgListener from '../hooks/useRobofleetMsgListener';
import { matchTopic } from '../util';
import { fb } from '../schema';

export default function ExampleViewer(props: { namespace: string }) {
  const { namespace } = props;
  const [loaded, setLoaded] = useState(false);

  useRobofleetMsgListener(
    matchTopic(namespace, 'example'),
    useCallback((buf, match) => {
      setLoaded(true);
      // const example = fb.example_msgs.Example.getRootAsExample(buf);
    }, [])
  );
  // note that, as per react docs, state setter identities are stable and we
  // do not need to add them to dependencies.

  if (!loaded) return <></>;

  return <div>Example</div>;
}
