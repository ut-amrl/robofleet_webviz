import React, { Dispatch, SetStateAction } from "react";
import { TimeTravelDispatcher } from "../hooks/useTimeTravelDispatcher";

export interface AppContextValue {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  timeTravelMaxCount: number;
  dispatchTimeTravel: TimeTravelDispatcher;
}

const AppContext = React.createContext({} as AppContextValue);
export default AppContext;
