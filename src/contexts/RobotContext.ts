import React, { Dispatch, SetStateAction } from "react";

// This context is meant to capture common robot information that may be extracted from messages, etc.
// Note that we still prefer most information to be passed to all the components via the standard react data flow
// This context exists so things that listen to messages can set more "global" robot state, e.g. mapName
export interface RobotContextValue {
  mapName: string | null,
  setMapName: Dispatch<SetStateAction<string | null>>;
}

const RobotContext = React.createContext({} as RobotContextValue);
export default RobotContext;
