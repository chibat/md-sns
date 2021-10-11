import { getGoogleUser } from "~/lib/auth.ts";
import {
  selectFollowingUsersPostByGtId,
  selectFollowingUsersPostByLtId,
  selectFollowingUsersPosts,
  selectPostByGtId,
  selectPostByLtId,
  selectPosts,
  selectUserPostByGtId,
  selectUserPostByLtId,
  selectUserPosts,
  selectUserByGoogleId,
} from "~/lib/db.ts";

import type { Post } from "~/lib/db.ts";
import type { APIHandler, APIResponse } from "aleph/types.d.ts";

export type RequestType = {
  postId?: number;
  direction?: "next" | "previous";
  userId?: number;
  followig?: boolean;
};
export type ResponseType = Array<Post>;

async function execute(params: RequestType, request: Request, response: APIResponse): Promise<ResponseType> {
  console.log(JSON.stringify(params));

  if (params.userId) {
    // specified user only
    if (params.direction === "next" && params.postId) {
      return await selectUserPostByLtId({
        ltId: params.postId,
        userId: params.userId,
      });
    } else if (params.direction === "previous" && params.postId) {
      const result = await selectUserPostByGtId({
        gtId: params.postId,
        userId: params.userId,
      });
      return result;
    }
    return await selectUserPosts(params.userId);
  } else if (params.followig) {
    // following user only
    const googleUser = await getGoogleUser(request, response);
    if (!googleUser) {
      return [];
    }
    const user = await selectUserByGoogleId(googleUser.id);
    if (!user) {
      return [];
    }
    const userId = user.id;
    if (params.direction === "next" && params.postId) {
      return await selectFollowingUsersPostByLtId({
        ltId: params.postId,
        userId,
      });
    } else if (params.direction === "previous" && params.postId) {
      const result = await selectFollowingUsersPostByGtId({
        gtId: params.postId,
        userId,
      });
      return result;
    }
    return await selectFollowingUsersPosts(userId);
  }

  // all user
  if (params.direction === "next" && params.postId) {
    const result = await selectPostByLtId(params.postId);
    return result;
  } else if (params.direction === "previous" && params.postId) {
    const result = await selectPostByGtId(params.postId);
    return result;
  }
  return await selectPosts();
}

export const handler: APIHandler = async ({ request, response }) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await execute(params, request, response);
  response.json(result);
};
