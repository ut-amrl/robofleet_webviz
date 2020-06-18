import React, { useState } from "react";
import useRobofleetMsgListener from "../hooks/useRobofleetMsgListener";
import { matchTopic } from "../util";
import { fb } from "../schema";

export default function ExampleViewer(props: {namespace: string}) {
  const { namespace } = props;
  const [loaded, setLoaded] = useState(false);

  useRobofleetMsgListener(matchTopic(namespace, "example"), (buf, match) => {
    setLoaded(true);
    // const example = fb.example_msgs.Example.getRootAsExample(buf);
  });
  
  if (!loaded)
    return <></>;

  return <div>Example</div>; 
}
