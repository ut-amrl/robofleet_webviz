import { useContext } from "react";
import WebSocketContext from "../contexts/WebSocketContext";
import useMessageListener from "./useMessageListener";
import { fb } from "../schema";
import useRobofleetSubscription from "./useRobofleetSubscription";

export type RobofleetMsgListener = (buffer: flatbuffers.ByteBuffer, match: RegExpMatchArray) => void;

/**
 * Listen for Robofleet messages on topics matching a given regular expression.
 * Ensure that the handler is memoized with useCallback() for performance.
 * 
 * @param regex a RegExp to test against the ROS message topic.
 * @param handler a listener that receives any matching flatbuffers and the regex match result
 */
export default function useRobofleetMsgListener(regex: RegExp, handler: RobofleetMsgListener, {enabled=true}: {enabled?: boolean}={}) {
  const ws = useContext(WebSocketContext);
  if (ws === null)
    throw new Error("No WebSocketContext provided.");
  
  useRobofleetSubscription(regex, {enabled});
  
  useMessageListener(ws, (buf) => {
    // get metadata for arbitrary message type that extends MsgWithMetadata
    const metadataMsg = fb.MsgWithMetadata.getRootAsMsgWithMetadata(buf);
    const topic = metadataMsg._metadata()?.topic();
    if (!topic)
      return;
    
    const match = topic.match(regex);
    if (match) {
      handler(buf, match);
    }
  });
}
