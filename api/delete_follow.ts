import { deleteFollow, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

import type { APIHandler } from "aleph/types.d.ts";

export type RequestType = { followingUserId: number };
export type ResponseType = {};

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
    await deleteFollow({ userId: user.id, followingUserId: requestJson.followingUserId });
    response.json({});
    return;
  }

  response.json(null);
};
