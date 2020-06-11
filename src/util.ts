import { flatbuffers } from "flatbuffers";
import { fb } from "./schema_generated";

export type MsgHandlers = Map<RegExp, (buffer: flatbuffers.ByteBuffer, match: RegExpMatchArray) => void>;

// group 1 matches namespace, group 2 matches topic
export const matchNamespacedTopic = (topic: string) => new RegExp(`(?:(.*)/)?(${topic})$`);

export async function dispatchRobofleetMsg(msg: MessageEvent, handlers: MsgHandlers) {
  const data = await msg.data.arrayBuffer();
  const buf = new flatbuffers.ByteBuffer(new Uint8Array(data));
  
  // get metadata for arbitrary message type that extends MsgWithMetadata
  const metadataMsg = fb.MsgWithMetadata.getRootAsMsgWithMetadata(buf);
  const topic = metadataMsg._metadata()?.topic();
  
  let matched = false;
  if (topic) {
    for (let [regex, handler] of handlers) {
      const match = topic.match(regex);
      if (match) {
        matched = true;
        handler(buf, match);
      }
    }
  }
  if (!matched) {
    console.warn(`Ignored message with topic: "${topic}"`);
  }
}
