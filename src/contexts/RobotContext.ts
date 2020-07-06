import React, { Dispatch, SetStateAction } from "react";

// This context is meant to capture common robot information that may be extracted from messages, etc.
export interface RobotContextValue {
  mapName: string | null,
  setMapName: Dispatch<SetStateAction<string | null>>;
}

const RobotContext = React.createContext({} as RobotContextValue);
export default RobotContext;
