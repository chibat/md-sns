import type { APIHandler } from "aleph/types.d.ts";
import { insertFollow, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

export type RequestType = { followingUserId: number; };
export type ResponseType = {};

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (!googleUser) {
    response.status = 401;
    return;
  }

  const requestJson: RequestType = await request.json();
  if (requestJson) {
    const user = await selectUserByGoogleId(googleUser.id);
    if (user) {
      await insertFollow({
        userId: user.id,
        followingUserId: requestJson.followingUserId,
      });
      const responseJson: ResponseType = {};
      response.json(responseJson);
      return;
    }
  }

  response.json({});
};
