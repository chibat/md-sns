import { getGoogleUser } from "~/lib/auth.ts";
import {
  selectFollowingUsersPostByGtId,
  selectFollowingUsersPostByLtId,
  selectFollowingUsersPosts,
  selectPostByGtId,
  selectPostByLtId,
  selectPosts,
  selectUserByGoogleId,
  selectUserPostByGtId,
  selectUserPostByLtId,
  selectUserPosts,
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

async function execute(
  params: RequestType,
  request: Request,
  response: APIResponse,
): Promise<ResponseType> {
  console.log(JSON.stringify(params));

  const googleUser = await getGoogleUser(request, response);
  const user = googleUser ? await selectUserByGoogleId(googleUser.id) : null;

  const posts = await (() => {
    if (params.userId) {
      // specified user only
      if (params.direction === "next" && params.postId) {
        return selectUserPostByLtId({
          ltId: params.postId,
          userId: params.userId,
        });
      } else if (params.direction === "previous" && params.postId) {
        return selectUserPostByGtId({
          gtId: params.postId,
          userId: params.userId,
        });
      }
      return selectUserPosts(params.userId);
    } else if (params.followig) {
      // following user only
      if (!user) {
        return [];
      }
      const userId = user.id;
      if (params.direction === "next" && params.postId) {
        return selectFollowingUsersPostByLtId({
          ltId: params.postId,
          userId,
        });
      } else if (params.direction === "previous" && params.postId) {
        return selectFollowingUsersPostByGtId({
          gtId: params.postId,
          userId,
        });
      }
      return selectFollowingUsersPosts(userId);
    } else {
      // all user
      if (params.direction === "next" && params.postId) {
        return selectPostByLtId(params.postId);
      } else if (params.direction === "previous" && params.postId) {
        return selectPostByGtId(params.postId);
      }
      return selectPosts();
    }
  })();

  return posts;
}

export const handler: APIHandler = async ({ request, response }) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await execute(params, request, response);
  response.json(result);
};
