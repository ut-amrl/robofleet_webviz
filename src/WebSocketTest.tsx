import React, { useEffect, useRef, useState } from "react";
import { flatbuffers } from "flatbuffers";
import { fb } from "./schema_generated";

export default function WebSocketTest(props: {url: string}) {
    const reconnectDelay = 2000;
    const timeout = useRef(null as number | null);
    const [ws, setWs] = useState(null as WebSocket | null);
    const [state, setState] = useState("disconnected");
    const [message, setMessage] = useState("");

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

            // check topic for arbitrary message type
            const metadata = fb.MsgWithMetadata.getRootAsMsgWithMetadata(buf);
            const topic = metadata._metadata()?.topic();

            if (topic === "/navsat/fix") {
                const obj = fb.sensor_msgs.NavSatFix.getRootAsNavSatFix(buf);
                // const statusConsts = fb.sensor_msgs.NavSatStatusConstants.getRootAsNavSatStatusConstants(new flatbuffers.ByteBuffer(new Uint8Array()));
                const statusConsts = fb.sensor_msgs.NavSatStatusConstants;
                const hasFix = obj.status()?.status() === statusConsts.status_no_fix.value;
                const message = `has fix: ${hasFix}; lat: ${obj.latitude()}, long: ${obj.longitude()}` ?? "<null>";
                setMessage(message);
            }
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
        <div>Message: {message}</div>
    </div>
}
