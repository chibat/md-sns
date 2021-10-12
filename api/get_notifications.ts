import { getGoogleUser } from "~/lib/auth.ts";
import { selectNotifications, selectUserByGoogleId } from "~/lib/db.ts";

import type { AppNotification } from "~/lib/db.ts";
import type { APIHandler } from "aleph/types.d.ts";

export type ResponseType = Array<AppNotification>;

export const handler: APIHandler = async ({ request, response }) => {
  const googleUser = await getGoogleUser(request, response);
  if (!googleUser) {
    response.json([]);
    return;
  }
  const user = await selectUserByGoogleId(googleUser.id);
  if (!user) {
    response.json([]);
    return;
  }
  const userId = user.id;
  const result = await selectNotifications(userId);

  response.json(result);
};
