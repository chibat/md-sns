import { selectComments } from '~/lib/db.ts';

import type { APIHandler } from "aleph/types.d.ts";
import type { Comment } from '~/lib/db.ts';

export type RequestType = { postId: number };
export type ResponseType = Array<Comment>;

export const handler: APIHandler = async ({request, response}) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await selectComments(params.postId);
  response.json(result);
};
