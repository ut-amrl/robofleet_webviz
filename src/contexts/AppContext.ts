import React, { Dispatch, SetStateAction } from 'react';

export interface AppContextValue {
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}

const AppContext = React.createContext({} as AppContextValue);
export default AppContext;
