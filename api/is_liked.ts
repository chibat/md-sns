import { getGoogleUser } from "~/lib/auth.ts";
import { selectLikes, selectUserByGoogleId } from "~/lib/db.ts";

import type { APIHandler } from "aleph/types.d.ts";

export type RequestType = { postId: number };

export const handler: APIHandler = async ({ request, response }) => {
  console.log(request.url);
  const params: RequestType = await request.json();
  const googleUser = await getGoogleUser(request, response);
  const user = googleUser ? await selectUserByGoogleId(googleUser.id) : null;
  if (user) {
    const results = await selectLikes({
      userId: user.id,
      postIds: [params.postId],
    }); // TODO: to one postId
    response.json(results.length === 1);
  } else {
    response.json(null);
  }
};
