import { useEffect, useState } from "react";
import config from "../config";

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
