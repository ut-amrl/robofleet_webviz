import { flatbuffers } from "flatbuffers";
import { fb } from "./schema_generated";

export type MsgHandlers = Map<RegExp, (buffer: flatbuffers.ByteBuffer, match: RegExpMatchArray) => void>;

// https://stackoverflow.com/a/3561711/1175802
// $& means the whole matched string
export const escapeRegExp = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

// group 1 matches namespace, group 2 matches topic
export const matchNamespacedTopic = (topic: string) => new RegExp(`(?:(.*)/)?(${escapeRegExp(topic)})$`);
export const matchExactTopic = (topic: string) => new RegExp(escapeRegExp(topic));

// polyfill for https://www.caniuse.com/#feat=mdn-api_blob_arraybuffer
let blobToArrayBuffer: (blob: Blob) => Promise<ArrayBuffer>;
if (Blob.prototype.hasOwnProperty("arrayBuffer")) {
  // console.log("Using Blob.arrayBuffer()");
  blobToArrayBuffer = (blob: any) => blob.arrayBuffer();
} else {
  // console.log("Using FileReader");
  blobToArrayBuffer = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(blob);
  });
}
export {blobToArrayBuffer};

export async function dispatchRobofleetMsg(msg: MessageEvent, handlers: MsgHandlers) {
  const data = await blobToArrayBuffer(msg.data);
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
