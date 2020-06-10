import React, { useState } from "react";
import { flatbuffers } from "flatbuffers";
import useWebSocket from "./hooks/useWebSocket";
import { fb } from "./schema_generated";

export default function WebSocketTest(props: {url: string}) {
    const {callbacks, state} = useWebSocket({url: props.url});
    const [status, setStatus] = useState("");
    const [navsatMsg, setNavsatMsg] = useState("");

    type Handlers = Map<RegExp, (buffer: flatbuffers.ByteBuffer, match: RegExpMatchArray) => void>;
    const handlers: Handlers = new Map();

    // group 1: namespace
    const rosNamespaced = (topic: string) => new RegExp(`(?:(.*)/)?${topic}$`);

    handlers.set(rosNamespaced("navsat/fix"), (buf, match) => {
        const obj = fb.sensor_msgs.NavSatFix.getRootAsNavSatFix(buf);
        // const statusConsts = fb.sensor_msgs.NavSatStatusConstants.getRootAsNavSatStatusConstants(new flatbuffers.ByteBuffer(new Uint8Array()));
        const statusConsts = fb.sensor_msgs.NavSatStatusConstants;
        const hasFix = obj.status()?.status() === statusConsts.status_no_fix.value;
        const msg = `has fix: ${hasFix}; lat: ${obj.latitude()}, long: ${obj.longitude()}` ?? "<null>";
        setNavsatMsg(msg);
    });

    handlers.set(rosNamespaced("status"), (buf, match) => {
        const obj = fb.amrl_msgs.RobofleetStatus.getRootAsRobofleetStatus(buf);
        setStatus(`status: ${obj.status()}, is_ok: ${obj.isOk()}, location: ${obj.location()}, battery: ${obj.batteryLevel()}`);
    });

    callbacks.onmessage = async (msg: MessageEvent) => {
        const data = await msg.data.arrayBuffer();
        const buf = new flatbuffers.ByteBuffer(new Uint8Array(data));

        // check topic for arbitrary message type
        const metadata = fb.MsgWithMetadata.getRootAsMsgWithMetadata(buf);
        const topic = metadata._metadata()?.topic();

        // handle dynamic dispatch based on message topic
        let matched = false;
        if (topic) {
            for (let [pattern, handler] of handlers) {
                const match = topic.match(pattern);
                if (match) {
                    matched = true;
                    handler(buf, match);
                }
            }
        }
        if (!matched) {
            console.warn(`Ignored message with topic: "${topic}"`);
        }
    };

    return <div style={{display: "flex", flexDirection: "column"}}>
        <div>Connection state: {state}</div>
        <div>Robot status: {status}</div>
        <div>Navsat: {navsatMsg}</div>
    </div>;
}
