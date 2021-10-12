import React from 'react'
import type { AppNotification } from '~/lib/db.ts';

type Props = {
  values: AppNotification[];
};

export default function Notifications(props: Props) {

  return (
    <>
      {props.values.map(notification =>
        <div className="mb-1" key={notification.id}>
          <span className="me-3">{new Date(notification.created_at).toLocaleString()}</span>
          {!notification.post_id && <a href={`/users/${notification.action_user_id}`}><b>{notification.name}</b> followed you.</a>
          }
          {notification.post_id && <a href={`/posts/${notification.post_id}`}><b>{notification.name}</b> commented on the post you are related to.</a>
          }
        </div>
      )}
    </>
  );
}
