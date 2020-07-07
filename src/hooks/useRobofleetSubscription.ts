import { flatbuffers } from "flatbuffers";
import { useContext, useEffect, useState, useCallback } from "react";
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

/**
 * Maintain a Robofleet subscription to the given topic regex.
 * This is invoked automatically by useRobofleetMsgListener, so you generally
 * should not have to use it explicitly.
 * 
 * @param topicRegex the topicRegex parameter for the Robofleet subscription
 * @param param1.enabled whether to be subscribed or not (allows conditional subscription)
 */
export default function useRobofleetSubscription(topicRegex: RegExp, {enabled=true}: {enabled?: boolean}={}) {
  const [shouldBeSubscribed, setShouldBeSubscribed] = useState(enabled);
  const ws = useContext(WebSocketContext);
  if (ws === null) {
    throw new Error("No WebSocketContext provided.");
  }

  const regexStr = topicRegex.source;

  const subscribe = useCallback(() => {
    const buf = makeSubscriptionMsg({
      topicRegex: regexStr,
      action: ACTION_SUBSCRIBE
    });
    ws.ws?.send(buf);
    console.log(`Subscribed to ${regexStr}`);
  }, [ws.ws, regexStr]);

  const unsubscribe = useCallback(() => {
    const buf = makeSubscriptionMsg({
      topicRegex: regexStr,
      action: ACTION_UNSUBSCRIBE
    });
    ws.ws?.send(buf);
    console.log(`Unsubscribed from ${regexStr}`);
  }, [ws.ws, regexStr]);

  // subscribe if should be subscribed, unsubscribe on cleanup if subscribed.
  useEffect(() => {
    if (!ws.connected)
      return;

    if (shouldBeSubscribed)
      subscribe();
    else
      unsubscribe();
    
    if (shouldBeSubscribed)
      return () => unsubscribe();
  }, [shouldBeSubscribed, ws.connected, subscribe, unsubscribe]);

  // unsubscribe on disable
  useEffect(() => {
    if (!enabled)
      setShouldBeSubscribed(false);
  }, [enabled]);
  
  // subscribe if enabled
  useEffect(() => {
    if (enabled)
      setShouldBeSubscribed(true);
  }, [enabled]);
}
