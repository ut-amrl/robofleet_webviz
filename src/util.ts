// https://stackoverflow.com/a/3561711/1175802
// $& means the whole matched string
export const escapeRegExp = (str: string) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

// match a particular topic in any namespace. Captures namespace as group "ns"
export const matchTopicAnyNamespace = (topic: string) => new RegExp(`(?:(?<ns>.*)/)?${escapeRegExp(topic)}$`);

// match a fully-qualified topic.
export const matchExactTopic = (exactTopic: string) => new RegExp(escapeRegExp(exactTopic));

// match any topic in a given namespace. Captures topic as group "topic"
export const matchAnyTopic = (namespace: string) => new RegExp(`${namespace}/(?<topic>.*)`);

// match a given topic in a given namespace.
export const matchTopic = (namespace: string, topic: string) => new RegExp(`${namespace}/${topic}`);

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
