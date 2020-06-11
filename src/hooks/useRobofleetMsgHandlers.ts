import { useContext } from "react";
import WebSocketContext from "../contexts/WebSocketContext";
import useMessageListener from "./useMessageListener";
import { dispatchRobofleetMsg, MsgHandlers } from "../util";

export default function useRobofleetMsgHandlers(msgHandlers: MsgHandlers) {
  const ws = useContext(WebSocketContext);
  useMessageListener(ws, async (msg) => {
    dispatchRobofleetMsg(msg, msgHandlers);
  });
}
