import type { APIHandler } from "aleph/types.d.ts";
import { insertComment, selectUserByGoogleId } from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

export type RequestType = { postId: number; source: string };
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
    if (requestJson.source.length > 5000) {
      response.status = 400;
      return;
    }
    const user = await selectUserByGoogleId(googleUser.id);
    if (user) {
      await insertComment({
        postId: requestJson.postId,
        userId: user.id,
        source: requestJson.source,
      });
      const responseJson: ResponseType = {};
      response.json(responseJson);
      return;
    }
  }

  response.json({});
};
