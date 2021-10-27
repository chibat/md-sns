import { getGoogleUser } from "~/lib/auth.ts";
import { ResponsePost } from "~/lib/types.ts";
import {
  selectLikedPosts,
  selectLikedPostsByGtId,
  selectLikedPostsByLtId,
  selectLikes,
  selectUserByGoogleId,
} from "~/lib/db.ts";

import type { APIHandler, APIResponse } from "aleph/types.d.ts";

export type RequestType = {
  postId?: number;
  direction?: "next" | "previous";
};

export type ResponseType = Array<ResponsePost>;

async function execute(
  params: RequestType,
  request: Request,
  response: APIResponse,
): Promise<ResponseType> {
  console.log(JSON.stringify(params));

  const googleUser = await getGoogleUser(request, response);
  const user = googleUser ? await selectUserByGoogleId(googleUser.id) : null;

  if (!user) {
    return [];
  }

  const posts = await (() => {
    if (params.direction === "next" && params.postId) {
      return selectLikedPostsByLtId({ userId: user.id, ltId: params.postId });
    } else if (params.direction === "previous" && params.postId) {
      return selectLikedPostsByGtId({ userId: user.id, gtId: params.postId });
    }
    return selectLikedPosts(user.id);
  })();

  const likedPostIds = user
    ? await selectLikes({
      userId: user.id,
      postIds: posts.map((post) => post.id),
    })
    : [];

  return posts.map((p) => {
    return {
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
  });
}

export const handler: APIHandler = async ({ request, response }) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await execute(params, request, response);
  response.json(result);
};
