import React from 'react';
import { Setter } from '../hooks/useStorage';

export interface IdTokenContextValue {
  idToken: string | null;
  setIdToken: Setter<string>;
}

const IdTokenContext = React.createContext({} as IdTokenContextValue);
export default IdTokenContext;
