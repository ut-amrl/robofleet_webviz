import { useLayoutEffect } from "react";
import { MessageListener, UseWebSocketResult } from "./useWebSocket";

/**
 * Automatically attach and detach a listener to a websocket created with useWebSocket().
 * The listener should be memoized with useCallback() for performance.
 * 
 * @param ws output of a useWebSocket()
 * @param listener a websocket message listener, which should be memoized.
 */
export default function(ws: UseWebSocketResult | null, listener: MessageListener) {
  useLayoutEffect(() => {
    if (ws !== null)
      ws.addMessageListener(listener);
    return () => {
      if (ws !== null)
        ws.removeMessageListener(listener);
    }
  }, [ws, listener]);
}
