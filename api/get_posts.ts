import type { APIHandler } from "aleph/types.d.ts";
import {
  selectPosts,
  selectPostByGtId,
  selectPostByLtId,
  selectUserPosts,
  selectUserPostByGtId,
  selectUserPostByLtId,
  selectFollowingUsersPosts,
  selectFollowingUsersPostByGtId,
  selectFollowingUsersPostByLtId,
} from "~/lib/db.ts";
import type { Post } from "~/lib/db.ts";

export type RequestType = {
  postId?: number;
  direction?: "next" | "previous";
  userId?: number;
  followig?: boolean;
};
export type ResponseType = Array<Post>;

async function execute(params: RequestType): Promise<ResponseType> {
  console.log(JSON.stringify(params));

  if (params.userId) {
    if (params.followig) {
      // following user only
      if (params.direction === "next" && params.postId) {
        return await selectFollowingUsersPostByLtId({
          ltId: params.postId,
          userId: params.userId,
        });
      } else if (params.direction === "previous" && params.postId) {
        const result = await selectFollowingUsersPostByGtId({
          gtId: params.postId,
          userId: params.userId,
        });
        return result;
      }
      return await selectFollowingUsersPosts(params.userId);
    } else {
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
    }
    return await selectUserPosts(params.userId);
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
  const result: ResponseType = await execute(params);
  response.json(result);
};
