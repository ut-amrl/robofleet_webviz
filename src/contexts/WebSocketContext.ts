import React from "react";
import { UseWebSocketResult } from "../hooks/useWebSocket";

const WebSocketContext = React.createContext(null as UseWebSocketResult | null);
export default WebSocketContext;
