import { deleteComment, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

import type { APIHandler } from "aleph/types.d.ts";

export type RequestType = { commentId: number };
export type ResponseType = {};

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (!googleUser) {
    return;
  }

  const requestJson: RequestType = await request.json();
  if (requestJson) {
    const user = await selectUserByGoogleId(googleUser.id);
    if (user) {
      await deleteComment({id: requestJson.commentId, userId: user.id});
    }
  }

  response.json({});
};
