import { useEffect } from "react";
import { UseWebSocketResult, MessageListener } from "./useWebSocket";

export default function(ws: UseWebSocketResult | null, listener: MessageListener) {
  useEffect(() => {
    if (ws !== null)
      ws.addMessageListener(listener);
    return () => {
      if (ws !== null)
        ws.removeMessageListener(listener);
    }
  }, [ws]);
}
