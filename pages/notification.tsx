import React from 'react'
import { useState, useEffect } from 'react'
import Notifications from '~/components/notifications.tsx'
import { request } from '~/lib/request.ts';
import { AppNotification } from '~/lib/db.ts';

import type { ResponseType } from "~/api/get_notifications.ts";

export default function User() {
  console.debug("start ");

  const [notifications, setNotifications] = useState<Array<AppNotification>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await request<void, ResponseType>("get_notifications");
      setNotifications(results);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <head>
        <title>md-sns</title>
      </head>
      {loading &&
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      {!loading &&
        <>
          <h1>Notification</h1>
          <Notifications values={notifications} />
          <br />
          <br />
        </>
      }
    </>
  );
}
