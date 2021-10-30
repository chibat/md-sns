import { getGoogleUser } from "~/lib/auth.ts";
import { selectPost, selectUserByGoogleId, selectLikes } from "~/lib/db.ts";

import type { APIHandler } from "aleph/types.d.ts";
import type { ResponsePost } from "~/lib/types.ts";

export type RequestType = { postId: number };
export type ResponseType = ResponsePost | null;

export const handler: APIHandler = async ({ request, response }) => {
  console.info(request.url);
  const params: RequestType = await request.json();

  const googleUser = await getGoogleUser(request, response);
  const user = googleUser ? await selectUserByGoogleId(googleUser.id) : null;
  const likedPostIds = user
  ? await selectLikes({ userId: user.id, postIds: [params.postId] })
  : [];

  const p = await selectPost(params.postId);
  if (p) {
    const post: ResponsePost = {
      id: p.id,
      user_id: p.user_id,
      source: p.source,
      updated_at: p.updated_at,
      created_at: p.created_at,
      comments: p.comments,
      name: p.name,
      picture: p.picture,
      likes: p.likes,
      liked: likedPostIds.includes(p.id),
    };
    response.json(post);
  } else {
    response.json(null);
  }
};
