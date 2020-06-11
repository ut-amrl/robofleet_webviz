import { useEffect, useRef, useState } from "react";

export type WebSocketState = "connecting" | "connected" | "disconnected";
export type MessageListener = (msg: MessageEvent) => void;

export type UseWebSocketResult = {
  addMessageListener: (fn: MessageListener) => void,
  removeMessageListener: (fn: MessageListener) => void,
  state: WebSocketState
};

export default function useWebSocket({url, reconnectDelay=2000}: {url: string, reconnectDelay?: number}): UseWebSocketResult {
  const timeout = useRef(null as number | null);
  const [ws, setWs] = useState(null as WebSocket | null);
  const [state, setState] = useState("disconnected" as WebSocketState);
  const listeners = useRef([] as Array<any>);

  const addMessageListener = (fn: MessageListener) => {
    listeners.current.push(fn);
  };

  const removeMessageListener = (fn: MessageListener) => {
    const idx = listeners.current.indexOf(fn);
    if (idx < 0) {
      throw new Error("Provided function is not attached as a listener");
    }
    listeners.current.splice(idx, 1);
  };
  
  useEffect(() => {
    if (ws === null)
    return;
    ws.onopen = () => {
      setState("connected");
    };
    ws.onclose = () => {
      setState("disconnected");
    };
    ws.onmessage = (msg) => {
      listeners.current.forEach((listener) => listener(msg));
    };
    ws.onerror = (error) => {};
  }, [ws]);
  
  // reconnect on disconnection
  useEffect(() => {
    if (state === "disconnected") {
      if (timeout.current !== null) {
        window.clearTimeout(timeout.current);
      }
      timeout.current = window.setTimeout(() => {
        setState("connecting");
        setWs(new WebSocket(url));
      }, reconnectDelay);
    }
  }, [url, reconnectDelay, state]);
  
  return {
    addMessageListener, 
    removeMessageListener, 
    state
  };
}
