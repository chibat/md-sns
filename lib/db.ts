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
  updated_at?: string;
  created_at?: string;
};

export type Post = {
  id: number;
  user_id: number;
  source: string;
  updated_at?: string;
  created_at?: string;
  name?: string; // app_user
  picture?: string; // app_user
  comments?: string; // comment
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  source: string;
  updated_at?: string;
  created_at?: string;
  name?: string; // app_user
  picture?: string; // app_user
};

export type Notification = {
  id: number;
  user_id: number;
  post_id: number;
  follower_user_id: number;
};

const pool = new Pool(dbUrl, POOL_CONNECTIONS);

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
  number
>(async (client, params) => {
  const result = await client.queryObject<{ id: number }>`
  INSERT INTO app_user (google_id, name, picture)
  VALUES (${params.googleId}, ${params.name}, ${params.picture})
  ON CONFLICT(google_id)
  DO UPDATE SET google_id=${params.googleId}, name=${params.name}, picture=${params.picture}, updated_at=CURRENT_TIMESTAMP
  RETURNING id
`;
  return result.rows[0].id;
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
    (SELECT count(*) || '' as comments FROM comment WHERE post_id=p.id)
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
    const results = await client.queryObject<
      { user_id: number; post_id: number }
    >`
      INSERT INTO notification (user_id, post_id)
      SELECT user_id, id FROM post
      WHERE id=${params.postId} AND user_id != ${params.userId}
      UNION
      SELECT DISTINCT user_id, post_id FROM comment
      WHERE post_id=${params.postId} AND user_id != ${params.userId}
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
      await client.queryObject<void>`
      INSERT INTO notification (user_id, follower_user_id)
      VALUES (${params.followingUserId}, ${params.userId})
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

export const selectNotifications = usePool<number, Array<Notification>>(
  async (client, userId) => {
    const result = await client.queryObject<Notification>`
      SELECT *
      FROM notification
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    try {
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
