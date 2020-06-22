import { flatbuffers } from "flatbuffers";
import { useContext, useEffect } from "react";
import WebSocketContext from "../contexts/WebSocketContext";
import { fb } from "../schema";

export const ACTION_SUBSCRIBE = fb.amrl_msgs.RobofleetSubscriptionConstants.action_subscribe.value;
export const ACTION_UNSUBSCRIBE = fb.amrl_msgs.RobofleetSubscriptionConstants.action_unsubscribe.value;

export function makeSubscriptionMsg({topicRegex, action}: {topicRegex: string, action: number}) {
  const fbb = new flatbuffers.Builder();

  // create metadata table
  const typeOffset = fbb.createString("RobofleetSubscription");
  const topicOffset = fbb.createString("/subscriptions"); // global subscriptions topic
  const metadata = fb.MsgMetadata.createMsgMetadata(fbb, typeOffset, topicOffset);
  
  const topicRegexOffset = fbb.createString(topicRegex);
  const msg = fb.amrl_msgs.RobofleetSubscription.createRobofleetSubscription(
    fbb,
    metadata,
    topicRegexOffset,
    action
  );
  fbb.finish(msg);
  return fbb.asUint8Array();
}

export default function useRobofleetSubscription(topicRegex: RegExp) {
  const ws = useContext(WebSocketContext);
  if (ws === null) {
    throw new Error("No WebSocketContext provided.");
  }
  
  useEffect(() => {
    const regexStr = topicRegex.source;
    const buf = makeSubscriptionMsg({
      topicRegex: regexStr,
      action: ACTION_SUBSCRIBE
    });
    ws.ws?.send(buf);
    console.log(`Subscribed to ${regexStr}`);

    return () => {
      const buf = makeSubscriptionMsg({
        topicRegex: regexStr,
        action: ACTION_UNSUBSCRIBE
      });
      ws.ws?.send(buf);
      console.log(`Unsubscribed from ${regexStr}`);
    };
  }, [ws.ws, topicRegex.source]);
}
