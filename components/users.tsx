import React from 'react'
import { useRouter } from 'aleph/react'

import type { User } from '~/lib/types.ts';

type Props = {
  users: User[];
};

export default function Users(props: Props) {
  const router = useRouter();

  function go(userId: number) {
    //router.push(``);
    location.href = `/users/${userId}`;
  }

  // <a href で遷移しない

  return (
    <>
      {props.users.map(user =>
        <div className="mb-3" key={user.userId}>
          <img src={user.picture} alt="mdo" width="32" height="32" className="rounded-circle me-2" />
          <a href="#" onClick={() => go(user.userId)} className="noDecoration">{user.name}</a>
        </div>
      )}
    </>
  );
}
