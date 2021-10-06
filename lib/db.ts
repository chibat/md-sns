#!/usr/bin/env -S deno run --allow-env --prompt --unstable --unsafely-ignore-certificate-errors
// server

import { Pool, PoolClient } from "https://deno.land/x/postgres@v0.11.3/mod.ts";

const POOL_CONNECTIONS = 5;
const PAGE_ROWS = 3;
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

const pool = new Pool(dbUrl, POOL_CONNECTIONS);

type ExecuteType<P, R> = (client: PoolClient, params: P) => Promise<R>;

function wrap<P, R>(execute: ExecuteType<P, R>) {
  return async (params: P): Promise<R> => {
    const client = await pool.connect();
    try {
      return execute(client, params);
    } catch (error) {
      await pool.end();
      const client = await pool.connect();
      return execute(client, params);
    } finally {
      await client.release();
    }
  };
}

export const upsertUser = wrap<
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

export const updateUser = wrap<
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

export const selectUserByGoogleId = wrap<
  string,
  AppUser | null
>(async (client, googleId) => {
  const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE google_id=${googleId}`;
  return result.rowCount ? result.rows[0] : null;
});

export const selectUser = wrap<number, AppUser | null>(
  async (client, userId) => {
    const result = await client.queryObject<AppUser>`
      SELECT * FROM app_user WHERE id = ${userId}
    `;
    return result.rowCount ? result.rows[0] : null;
  },
);

export const insertPost = wrap<
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

export const updatePost = wrap<
  { postId: number; userId: number; source: string },
  void
>(async (client, params) => {
  await client.queryObject`
      UPDATE post SET source = ${params.source}
      WHERE id = ${params.postId} and user_id = ${params.userId}
      RETURNING id
    `;
});

export const deletePost = wrap<{ id: number; userId: number }, void>(
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

export const selectPosts = wrap<void, Array<Post>>(async (
  client,
  _,
) => {
  const result = await client.queryObject<Post>(
    `${SELECT_POST} ORDER BY p.id DESC LIMIT ${PAGE_ROWS}`,
  );
  return result.rows;
});

export const selectPostsByUserId = wrap<number, Array<Post>>(
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

export const selectPostByLtId = wrap<number, Array<Post>>(
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

export const selectPostByLtIdUserId = wrap<
  { ltId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `
      ${SELECT_POST}
      WHERE p.id < $1 and p.user_id = $2
      ORDER BY p.id DESC LIMIT ${PAGE_ROWS}
    `,
    params.ltId,
    params.userId,
  );
  return result.rows;
});

export const selectPostByGtId = wrap<number, Array<Post>>(
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

export const selectPostByGtIdUserId = wrap<
  { gtId: number; userId: number },
  Array<Post>
>(async (client, params) => {
  const result = await client.queryObject<Post>(
    `SELECT * FROM (
        ${SELECT_POST}
        WHERE p.id > $1 AND p.user_id = $2
        ORDER BY p.id LIMIT ${PAGE_ROWS}
      ) s ORDER BY id DESC
    `,
    params.gtId,
    params.userId,
  );
  return result.rows;
});

export const selectPost = wrap<number, Post | null>(async (
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

export const insertComment = wrap<
  { postId: number; userId: number; source: string },
  number
>(async (client, params) => {
  const result = await client.queryObject<{ id: number }>`
      INSERT INTO comment (post_id, user_id, source)
      VALUES (${params.postId}, ${params.userId}, ${params.source})
      RETURNING id
    `;
  return result.rows[0].id;
});

export const selectComments = wrap<number, Array<Comment>>(
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

export const deleteComment = wrap<{ id: number; userId: number }, void>(
  async (client, params) => {
    await client.queryObject`
      DELETE FROM comment where id = ${params.id} and user_id = ${params.userId}
    `;
  },
);
