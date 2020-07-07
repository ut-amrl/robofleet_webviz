import { useEffect, useState } from 'react';
import config from '../config';

export type Op = 'send' | 'receive';

/**
 * Determine whether this client is authorized to perform a particular action
 * on the Robofleet server.
 *
 * @param params.idToken a Google ID token, if available
 * @param params.op the operation being performed on the topic
 * @param params.topic the ROS topic
 * @returns a boolean indicating if the client is authorized, or null if no
 * result is available yet.
 */
export default function useAuthCheck({
  idToken,
  op,
  topic,
}: {
  idToken?: string | null;
  op: Op;
  topic: string;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const baseUrl = new URL(config.serverUrl);
      baseUrl.protocol = window.location.protocol;
      const url = new URL('check-auth', baseUrl).toString();

      const res = await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(idToken && { id_token: idToken }),
          op,
          topic,
        }),
      });

      if (!res.ok) {
        console.error(`check-auth error ${res.status}`);
        return;
      }

      const isAuthorized = await res.json();
      if (typeof isAuthorized === 'boolean') {
        if (isAuthorized !== authorized) {
          setAuthorized(isAuthorized);
        }
      } else {
        console.error('Received non-boolean result from check-auth endpoint.');
        setAuthorized(null);
      }
    })();
  }, [authorized, idToken, op, topic]);

  return authorized;
}
