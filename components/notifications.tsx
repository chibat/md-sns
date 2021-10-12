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
          <span className="me-3">{notification.created_at}</span>
          {notification.follower_user_id && <a href={`/users/${notification.follower_user_id}`}>XXXX followed you.</a>
          }
          {notification.post_id && <a href={`/posts/${notification.post_id}`}>XXXX commented on the post you are related to.</a>
          }
        </div>
      )}
    </>
  );
}
