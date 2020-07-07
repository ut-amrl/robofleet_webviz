import { useEffect, useState } from "react";
import config from "../config";

/**
 * Retrieve the client's IP address as seen by the Robofleet server, using the
 * server's echo-ip API.
 * 
 * @returns this client's IP address
 */
export default function useIpAddress() {
  const [ipAddr, setIpAddr] = useState<string | null>(null);

  useEffect(() => {
    const fetchIp = async () => {
      const baseUrl = new URL(config.serverUrl);
      baseUrl.protocol = window.location.protocol;
      const res = await fetch(new URL("echo-ip", baseUrl).toString());
      if (res.status === 200) {
        setIpAddr(await res.text());
      }
    };
    fetchIp();
  }, []);

  return ipAddr;
}
