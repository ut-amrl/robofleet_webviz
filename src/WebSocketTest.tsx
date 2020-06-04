import React, { useEffect, useRef, useState } from "react";
import { flatbuffers } from "flatbuffers";
import { StdMsgsString } from "./std_msgs_string_generated";

export default function WebSocketTest(props: {url: string}) {
    const reconnectDelay = 2000;
    const timeout = useRef(null as number | null);
    const [ws, setWs] = useState(null as WebSocket | null);
    const [state, setState] = useState("disconnected");
    const [messages, setMessages] = useState([] as Array<string>);

    useEffect(() => {
        if (ws === null)
            return;
        ws.onopen = () => {
            console.log("Websocket connected.");
            setState("connected");
        };
        ws.onclose = () => {
            console.log("Websocket disconnected.");
            setState("disconnected");
        };
        ws.onmessage = async (msg) => {
            const data = await msg.data.arrayBuffer();
            const buf = new flatbuffers.ByteBuffer(new Uint8Array(data));
            const obj = StdMsgsString.getRootAsStdMsgsString(buf);
            setMessages((messages) => [...messages, obj.data() ?? "<null>"]);
        };
        ws.onerror = (error) => {
            console.error("Websocket error", error);
        };
    }, [ws]);

    // reconnect on disconnection
    useEffect(() => {
        console.log("state: ", state);
        if (state === "disconnected") {
            if (timeout.current !== null) {
                window.clearTimeout(timeout.current);
            }
            timeout.current = window.setTimeout(() => {
                console.log("reconnecting");
                setState("connecting");
                setWs(new WebSocket(props.url));
            }, reconnectDelay);
        }
    }, [props.url, state]);

    return <div style={{display: "flex", flexDirection: "column"}}>
        <div>Connection state: {state}</div>
        {messages.map((m, i) => <div key={i}>{m}</div>)}
    </div>
}
