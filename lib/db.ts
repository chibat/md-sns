#!/usr/bin/env -S deno run --allow-env --prompt --unstable --unsafely-ignore-certificate-errors
// server

import { Pool, PoolClient } from "https://deno.land/x/postgres@v0.11.3/mod.ts";
import { PAGE_ROWS } from "~/lib/constants.ts";

const POOL_CONNECTIONS = 5;
const dbUrl = Deno.env.get("DATABASE_URL");

if (!dbUrl) {
  Deno.exit(1);
}

export type AppUser = {
  id: number;
  google_id?: string;
  name?: string;
  picture?: string;
  notification: boolean;
  updated_at?: string;
  created_at?: string;
};

export type Post = {
  id: number;
  user_id: number;
  source: string;
  updated_at: string;
  created_at: string;
  name?: string; // app_user
  picture?: string; // app_user
  comments?: string; // comment
  likes: string; // likes
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  source: string;
  updated_at: string;
  created_at: string;
  name?: string; // app_user
  picture?: string; // app_user
};

export type AppNotification = {
  id: number;
  user_id: number;
  type: "follow" | "like" | "comment" | null;
  action_user_id: number;
  post_id: number;
  created_at: string;
  name?: string; // app_user
};

const pool = new Pool(dbUrl, POOL_CONNECTIONS, true);

type ExecuteType<P, R> = (client: PoolClient, params: P) => Promise<R>;

function usePool<P, R>(execute: ExecuteType<P, R>) {
  return async (params: P): Promise<R> => {
    console.log(`pool size: ${pool.size}`);
    const client = await pool.connect();
    try {
      const result = await execute(client, params);
      await client.release();
      return result;
    } catch (error) {
      // retry
      console.log("retry");
      await client.release();
      await pool.end();
      console.log(`pool size: ${pool.size}`);
      try {
        const client = await pool.connect();
        const result = await execute(client, params);
        await client.release();
        return result;
      } catch (error) {
        await client.release();
        await pool.end();
        console.log(`pool size: ${pool.size}`);
        throw error;
      }
    }
  };
}

export const upsertUser = usePool<
  { googleId: string; name: string; picture: string },
  AppUser
>(async (client, params) => {
  const result = await client.queryObject<AppUser>`
  INSERT INTO app_user (google_id, name, picture)
  VALUES (${params.googleId}, ${params.name}, ${params.picture})
  ON CONFLICT(google_id)
  DO UPDATE SET google_id=${params.googleId}, name=${params.name}, picture=${params.picture}, updated_at=CURRENT_TIMESTAMP
  RETURNING *
`;
  return result.rows[0];
});

export const updateUser = usePool<
  { id: number; name: string; picture: string },
  void
>(async (client, params) => {
  console.log("updateUser");
  await client.queryObject<{ id: number }>`
      UPDATE app_user
      SET name=${params.name}, picture=${params.picture}, updated_at=CURRENT_TIMESTAMP
      WHERE id = ${params.id}
    `;
  return;
});

export const selectUserByGoogleId = usePool<string, AppUser | null>(
  async (client, googleId) => {
    const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE google_id=${googleId}`;
    return result.rowCount ? result.rows[0] : null;
  },
);

export const selectUser = usePool<number, AppUser | null>(
  async (client, userId) => {
    const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE id = ${userId}
    `;
    return result.rowCount ? result.rows[0] : null;
  },
);

export const insertPost = usePool<
  { userId: number; source: string },
  number
>(async (client, params) => {
  const result = await client.queryObject<{ id: number }>`
      INSERT INTO post (user_id, source)
      VALUES (${params.userId}, ${params.source})
      RETURNING id
    `;
  return result.rows[0].id;
});

export const updatePost = usePool<
  { postId: number; userId: number; source: string },
  void
>(async (client, params) => {
  await client.queryObject`
      UPDATE post SET source = ${params.source}, updated_at=CURRENT_TIMESTAMP
      WHERE id = ${params.postId} and user_id = ${params.userId}
      RETURNING id
    `;
});

export const deletePost = usePool<{ id: number; userId: number }, void>(
  async (client, params) => {
    await client.queryObject`
      DELETE FROM post where id = ${params.id} and user_id = ${params.userId}
    `;
  },
);

const SELECT_POST = `
  SELECT
    p.*,
    u.name, u.picture,
    (SELECT count(*) || '' as comments FROM comment WHERE post_id=p.id),
    (SELECT count(*) || '' as likes FROM likes WHERE post_id=p.id)
  FROM post p
  LEFT JOIN app_user u ON (p.user_id = u.id)
`;

export const selectPost = usePool<number, Post | null>(async (
  client,
  id,
) => {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.id=$1`,
    id,
  );
  return result.rowCount ? result.rows[0] : null;
});

export const selectPosts = usePool<void, Array<Post>>(async (
  client,
  _,
) => {
  const result = await client.queryObject<Post>(
    `${SELECT_POST} ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
  );
  return result.rows;
});

export const selectPostByLtId = usePool<number, Array<Post>>(
  async (client, ltId) => {
    const result = await client.queryObject<Post>(
      `
      ${SELECT_POST}
      WHERE p.id < $1
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
      ltId,
    );
    return result.rows;
  },
);

export const selectPostByGtId = usePool<number, Array<Post>>(
  async (client, gtId) => {
    const result = await client.queryObject<Post>(
      `SELECT * FROM (
        ${SELECT_POST}
        WHERE p.id > $1
        ORDER BY p.id LIMIT ${PAGE_ROWS}
      ) s ORDER BY id DESC
    `,
      gtId,
    );
    return result.rows;
  },
);

export const selectUserPosts = usePool<number, Array<Post>>(
  async (client, userId) => {
    const result = await client.queryObject<Post>(
      `
      ${SELECT_POST}
      WHERE p.user_id = $1
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
      userId,
    );
    return result.rows;
  },
);

export const selectUserPostByLtId = usePool<
  { ltId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id = $1
      AND p.id < $2
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    params.userId,
    params.ltId,
  );
  return result.rows;
});

export const selectUserPostByGtId = usePool<
  { gtId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `SELECT * FROM (
        ${SELECT_POST}
        WHERE p.user_id = $1
        AND p.id > $2
        ORDER BY p.id LIMIT ${PAGE_ROWS}
      ) s ORDER BY id DESC
    `,
    params.userId,
    params.gtId,
  );
  return result.rows;
});

export const selectFollowingUsersPosts = usePool<number, Array<Post>>(
  async (client, userId) => {
    const result = await client.queryObject<Post>(
      `
      ${SELECT_POST}
      WHERE p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = $1)
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
      userId,
    );
    return result.rows;
  },
);

export const selectFollowingUsersPostByLtId = usePool<
  { ltId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = $1)
      AND p.id < $2
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    params.userId,
    params.ltId,
  );
  return result.rows;
});

export const selectFollowingUsersPostByGtId = usePool<
  { gtId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `SELECT * FROM (
        ${SELECT_POST}
        WHERE p.user_id IN (SELECT following_user_id FROM follow WHERE user_id = $1)
        AND p.id > $2
        ORDER BY p.id LIMIT ${PAGE_ROWS}
      ) s ORDER BY id DESC
    `,
    params.userId,
    params.gtId,
  );
  return result.rows;
});

export const insertComment = usePool<
  { postId: number; userId: number; source: string },
  void
>(async (client, params) => {
  await client.queryObject<{ id: number }>`
      INSERT INTO comment (post_id, user_id, source)
      VALUES (${params.postId}, ${params.userId}, ${params.source})
      RETURNING id
    `;

  try {
    // TODO async for performance
    const results = await client.queryObject<
      { user_id: number; post_id: number }
    >`
      INSERT INTO notification (user_id, type, post_id, action_user_id)
      SELECT user_id, 'comment'::notification_type, id, ${params.userId}::integer FROM post
      WHERE id=${params.postId} AND user_id != ${params.userId}
      UNION
      SELECT DISTINCT user_id, 'comment'::notification_type, post_id, ${params.userId}::integer FROM comment
      WHERE post_id=${params.postId} AND user_id != ${params.userId}
      RETURNING user_id, post_id
  `;

    for (const row of results.rows) {
      client.queryObject`
        UPDATE app_user
        SET notification = true
        WHERE id = ${row.user_id}
  `;
    }
  } catch (error) {
    console.warn(error);
  }
});

export const selectComments = usePool<number, Array<Comment>>(
  async (client, postId) => {
    const result = await client.queryObject<Comment>`
      SELECT
        c.*,
        u.name, u.picture
      FROM comment c
      LEFT JOIN app_user u ON (c.user_id = u.id)
      where c.post_id = ${postId}
      ORDER BY c.id LIMIT 100`;
    return result.rows;
  },
);

export const deleteComment = usePool<{ id: number; userId: number }, void>(
  async (client, params) => {
    await client.queryObject`
      DELETE FROM comment where id = ${params.id} and user_id = ${params.userId}
    `;
  },
);

export const insertFollow = usePool<
  { userId: number; followingUserId: number },
  void
>(
  async (client, params) => {
    await client.queryObject<void>`
      INSERT INTO follow (user_id, following_user_id)
      VALUES (${params.userId}, ${params.followingUserId})
    `;

    try {
      // TODO async for performance
      await client.queryObject<void>`
      INSERT INTO notification (user_id, type, action_user_id)
      VALUES (${params.followingUserId}, 'follow', ${params.userId})
    `;

      await client.queryObject`
      UPDATE app_user
      SET notification = true
      WHERE id = ${params.followingUserId}
    `;
    } catch (error) {
      console.warn(error);
    }
  },
);

export const deleteFollow = usePool<
  { userId: number; followingUserId: number },
  void
>(
  async (client, params) => {
    await client.queryObject<void>`
      DELETE FROM follow
      WHERE user_id = ${params.userId} and following_user_id = ${params.followingUserId}
    `;
  },
);

export const selectFollowingUsers = usePool<number, Array<AppUser>>(
  async (client, userId) => {
    const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT following_user_id FROM follow WHERE user_id = ${userId} ORDER BY created_at DESC)
    `;
    return result.rows;
  },
);

export const selectFollowerUsers = usePool<number, Array<AppUser>>(
  async (client, followingUserId) => {
    const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM follow WHERE following_user_id = ${followingUserId} ORDER BY created_at DESC)
    `;
    return result.rows;
  },
);

export const selectCountFollowing = usePool<number, string>(
  async (client, userId) => {
    const result = await client.queryObject<{ cnt: string }>`
      SELECT count(*) || '' as cnt
      FROM app_user
      WHERE id
      IN (SELECT following_user_id FROM follow WHERE user_id = ${userId} ORDER BY created_at DESC)
    `;
    return result.rows[0].cnt;
  },
);

export const selectCountFollower = usePool<number, string>(
  async (client, followingUserId) => {
    const result = await client.queryObject<{ cnt: string }>`
      SELECT count(*) || '' as cnt
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM follow WHERE following_user_id = ${followingUserId} ORDER BY created_at DESC)
    `;
    return result.rows[0].cnt;
  },
);

export const judgeFollowing = usePool<
  { userId: number; followingUserId: number },
  boolean
>(
  async (client, params) => {
    const result = await client.queryObject<{ cnt: string }>`
      SELECT 1 FROM follow WHERE user_id = ${params.userId} AND following_user_id = ${params.followingUserId}
    `;
    return result.rows.length === 1;
  },
);

export const selectNotifications = usePool<number, Array<AppNotification>>(
  async (client, userId) => {
    const result = await client.queryObject<AppNotification>`
      SELECT n.*, u.name
      FROM notification n
      LEFT OUTER JOIN app_user U on (n.action_user_id = u.id)
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    try {
      // TODO async for performance
      await client.queryObject`
        UPDATE app_user
        SET notification = false
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.log(error);
    }

    return result.rows;
  },
);

export const insertLike = usePool<
  { userId: number; postId: number },
  void
>(
  async (client, params) => {
    await client.queryObject<void>`
      INSERT INTO likes (user_id, post_id)
      VALUES (${params.userId}, ${params.postId})
    `;

    try {
      // TODO async for performance
      const results = await client.queryObject<
        { user_id: number; post_id: number }
      >`
        INSERT INTO notification (user_id, type, post_id, action_user_id)
        SELECT user_id, 'like', id, ${params.userId} FROM post
        WHERE id=${params.postId} AND user_id != ${params.userId}
        RETURNING user_id, post_id
      `;

      for (const row of results.rows) {
        await client.queryObject`
          UPDATE app_user
          SET notification = true
          WHERE id = ${row.user_id}
        `;
      }
    } catch (error) {
      console.warn(error);
    }
  },
);

export const deleteLike = usePool<
  { userId: number; postId: number },
  void
>(
  async (client, params) => {
    await client.queryObject<void>`
      DELETE FROM likes
      WHERE user_id = ${params.userId} AND post_id = ${params.postId}
    `;
  },
);

export const selectLikes = usePool<
  { userId: number; postIds: number[] },
  number[]
>(
  async (client, { userId, postIds }) => {
    const result = await client.queryObject<{ post_id: number }>(`
      SELECT post_id
      FROM likes p
      WHERE user_id = $1
      AND post_id = ANY($2::int[])
    `, userId, postIds);

    return result.rows.map((row) => row.post_id);
  },
);

export const selectLikeUsers = usePool<number, Array<AppUser>>(
  async (client, postId) => {
    const result = await client.queryObject<AppUser>`
      SELECT *
      FROM app_user
      WHERE id
      IN (SELECT user_id FROM likes WHERE post_id = ${postId} ORDER BY created_at DESC)
    `;
    return result.rows;
  },
);
