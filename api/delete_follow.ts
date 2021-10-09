import type { APIHandler } from "aleph/types.d.ts";
import { deleteFollow, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

export type RequestType = { userId: number };
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
    await deleteFollow({ userId: user.id, following: requestJson.userId });
    response.json({});
    return;
  }

  response.json(null);
};
