import { UseWebSocketResult } from "./useWebSocket";
import { useRef, useCallback } from "react";
import useMessageListener from "./useMessageListener";

export type TimeTravelDispatcher = (backward: number) => void;

export default function useTimeTravelDispatcher(ws: UseWebSocketResult, {maxCount}: {maxCount: number}) {
  const buffer = useRef([] as Array<flatbuffers.ByteBuffer>);

  useMessageListener(ws, useCallback((msg) => {
    buffer.current.push(msg);
    buffer.current.splice(0, Math.max(0, buffer.current.length - maxCount));
  }, [maxCount]));

  const dispatch: TimeTravelDispatcher = useCallback((backward) => {
    let index = buffer.current.length - 1 - backward;
    index = Math.max(0, Math.min(buffer.current.length - 1, index));
    ws.dispatch(buffer.current[index]);
  }, [ws]);

  return dispatch;
}
