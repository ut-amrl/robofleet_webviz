import { useContext } from "react";
import WebSocketContext from "../contexts/WebSocketContext";
import useMessageListener from "./useMessageListener";
import { fb } from "../schema";

export type RobofleetMsgListener = (buffer: flatbuffers.ByteBuffer, match: RegExpMatchArray) => void;

export default function useRobofleetMsgListener(regex: RegExp, handler: RobofleetMsgListener) {
  const ws = useContext(WebSocketContext);
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
