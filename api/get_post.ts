import type { APIHandler } from "aleph/types.d.ts";
import { selectPost } from "~/lib/db.ts";
import type { Post } from "~/lib/db.ts";

export type RequestType = { postId: number };
export type ResponseType = Post | null;

export const handler: APIHandler = async ({request, response}) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await selectPost(params.postId);
  response.json(result);
};


