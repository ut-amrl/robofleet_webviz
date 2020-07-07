import React, { Dispatch, SetStateAction } from 'react';

export interface IdTokenContextValue {
    idToken: string | null;
    setIdToken: Dispatch<SetStateAction<string | null>>;
}

const IdTokenContext = React.createContext({} as IdTokenContextValue);
export default IdTokenContext;
