// need to import flatbuffers before generated schema
// this ensures that this happens
// eslint-disable-next-line
import { flatbuffers } from "flatbuffers" // do not remove
import { fb } from './schema_generated';

export { fb };
