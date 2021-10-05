import type { APIHandler } from "aleph/types.d.ts";
import {
  selectPostByGtId,
  selectPostByGtIdUserId,
  selectPostByLtId,
  selectPostByLtIdUserId,
  selectPosts,
  selectPostsByUserId,
} from "~/lib/db.ts";
import type { Post } from "~/lib/db.ts";

export type RequestType = {
  postId?: number;
  direction?: "next" | "previous";
  userId?: number;
};
export type ResponseType = Array<Post>;

async function execute(params: RequestType): Promise<ResponseType> {
  console.log(JSON.stringify(params));

  if (params.userId) {
    if (params.direction === "next" && params.postId) {
      return await selectPostByLtIdUserId({
        ltId: params.postId,
        userId: params.userId,
      });
    } else if (params.direction === "previous" && params.postId) {
      const result = await selectPostByGtIdUserId({
        gtId: params.postId,
        userId: params.userId,
      });
      return result;
    }
    return await selectPostsByUserId(params.userId);
  }

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
