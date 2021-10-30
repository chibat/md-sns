import { deletePost, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

import type { APIHandler } from "aleph/types.d.ts";

export type RequestType = { postId: number };
export type ResponseType = { postId: number };

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (!googleUser) {
    response.status = 401;
    return;
  }
  const user = await selectUserByGoogleId(googleUser.id);
  const requestJson: RequestType = await request.json();
  if (requestJson && user) {
    await deletePost({id: requestJson.postId, userId: user.id});
    const responseJson: ResponseType = {postId: requestJson.postId};
    response.json(responseJson);
    return;
  }

  response.json(null);
};
