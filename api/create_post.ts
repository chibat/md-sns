import { insertPost, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

import type { APIHandler } from "aleph/types.d.ts";

export type RequestType = { source: string };
export type ResponseType = { postId: number };

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (!googleUser) {
    response.status = 401;
    return;
  }

  const requestJson: RequestType = await request.json();
  if (requestJson) {
    if (requestJson.source.length > 10000) {
      response.status = 400;
      return;
    }
    const user = await selectUserByGoogleId(googleUser.id);
    if (user) {
      const postId = await insertPost({
        userId: user.id,
        source: requestJson.source,
      });
      const responseJson: ResponseType = { postId };
      response.json(responseJson);
      return;
    }
  }

  response.json({});
};
