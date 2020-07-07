import { useEffect, useRef, useState, useCallback } from 'react';
import { flatbuffers } from 'flatbuffers';
import { blobToArrayBuffer } from '../util';

type WebSocketState = 'connecting' | 'connected' | 'disconnected';
export type MessageListener = (buf: flatbuffers.ByteBuffer) => void;

export type UseWebSocketResult = {
    /**
     * Register a callback to fire for each received message.
     */
    addMessageListener: (fn: MessageListener) => void;

    /**
     * Unregister a previously-registered message listener callback.
     */
    removeMessageListener: (fn: MessageListener) => void;

    /**
     * Whether the WebSocket is connected to the server.
     */
    connected: boolean;

    /**
     * The actual WebSocket instance.
     */
    ws: WebSocket | null;
};

/**
 * Maintain a WebSocket connection with the Robofleet server.
 *
 * @param params.url Full URL of the Robofleet server
 * @param params.idToken ID token, if available
 * @param params.paused Whether to pause firing message listeners
 * @param params.reconnectDelay How many milliseconds to wait before attempting to reconnect
 * @returns a UseWebSocketResult
 */
export default function useWebSocket({
    url,
    idToken = null,
    paused = false,
    reconnectDelay = 2000,
}: {
    url: string;
    idToken?: string | null;
    paused?: boolean;
    reconnectDelay?: number;
}): UseWebSocketResult {
    const pausedRef = useRef(false);
    const interval = useRef(null as number | null);
    const ws = useRef(null as WebSocket | null);
    const state = useRef('disconnected' as WebSocketState);
    const listeners = useRef([] as Array<any>);
    const [connected, setConnected] = useState(false);

    pausedRef.current = paused;

    const addMessageListener = (fn: MessageListener) => {
        listeners.current.push(fn);
    };

    const removeMessageListener = (fn: MessageListener) => {
        const idx = listeners.current.indexOf(fn);
        if (idx < 0) {
            throw new Error('Provided function is not attached as a listener');
        }
        listeners.current.splice(idx, 1);
    };

    // fires message listeners
    const dispatch = useCallback((buf: flatbuffers.ByteBuffer) => {
        listeners.current.forEach((listener) => listener(buf));
    }, []);

    // [re]initializes websocket connection
    const reconnect = useCallback(() => {
        ws.current = new WebSocket(url);
        ws.current.onopen = () => {
            state.current = 'connected';
            setConnected(true);
        };
        ws.current.onclose = () => {
            state.current = 'disconnected';
            setConnected(false);
        };
        ws.current.onmessage = async (msg) => {
            if (pausedRef.current) return;
            const data = await blobToArrayBuffer(msg.data);
            const buf = new flatbuffers.ByteBuffer(new Uint8Array(data));
            dispatch(buf);
        };
        ws.current.onerror = (error) => {
            console.error('WebSocket error: ');
            console.error(error);
        };
    }, [url, dispatch]);

    // automatic reconnect
    useEffect(() => {
        if (connected) {
            if (interval.current !== null) {
                window.clearInterval(interval.current);
                interval.current = null;
            }
        } else {
            if (interval.current === null) {
                interval.current = window.setInterval(() => {
                    if (state.current === 'disconnected') {
                        state.current = 'connecting';
                        reconnect();
                    }
                }, reconnectDelay);
            }
        }
    }, [connected, reconnectDelay, reconnect]);

    // authenticate
    useEffect(() => {
        if (!connected) return;

        // sending null de-auths (signs out) the user
        const data = JSON.stringify({
            id_token: idToken ?? null,
        });
        ws.current?.send(data);
    }, [connected, idToken]);

    // reconnect on startup/prop change
    useEffect(() => reconnect(), [reconnect]);

    return {
        addMessageListener,
        removeMessageListener,
        connected,
        ws: ws.current,
    };
}
