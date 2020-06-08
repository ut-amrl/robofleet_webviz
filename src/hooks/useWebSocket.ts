import { useEffect, useRef, useState } from "react";

export type WebSocketState = "connecting" | "connected" | "disconnected";

export type UseWebSocketResult = {
    callbacks: {
        onopen: () => void,
        onclose: () => void,
        onerror: (error: Event) => void,
        onmessage: (msg: MessageEvent) => void,
    },
    state: WebSocketState
};

export default function useWebSocket({url, reconnectDelay=2000}: {url: string, reconnectDelay?: number}): UseWebSocketResult {
    const timeout = useRef(null as number | null);
    const callbacks = useRef({
        onopen: () => {},
        onclose: () => {},
        onerror: (_: Event) => {},
        onmessage: (_: MessageEvent) => {}
    });
    const [ws, setWs] = useState(null as WebSocket | null);
    const [state, setState] = useState("disconnected" as WebSocketState);

    useEffect(() => {
        if (ws === null)
            return;
        ws.onopen = () => {
            setState("connected");
            callbacks.current.onopen();
        };
        ws.onclose = () => {
            setState("disconnected");
            callbacks.current.onclose();
        };
        ws.onmessage = (msg) => {
            callbacks.current.onmessage(msg);
        };
        ws.onerror = (error) => {
            callbacks.current.onerror(error);
        };
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

    return {callbacks: callbacks.current, state};
}
