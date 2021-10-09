import type { APIHandler } from "aleph/types.d.ts";
import {
  judgeFollowing,
  selectCountFollower,
  selectCountFollowing,
  selectUser,
  selectUserByGoogleId,
} from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";
import { User } from "~/lib/types.ts";
import { defaultString } from "~/lib/utils.ts";

export type RequestType = { userId: number };
export type ResponseType = {
  user: User | null;
  following: string;
  followers: string;
  isFollowing: boolean;
};

export const handler: APIHandler = async ({ request, response }) => {
  const params: RequestType = await request.json();
  const appUser = await selectUser(params.userId);
  if (!appUser) {
    response.status = 404;
    return;
  }
  const user: User = {
    userId: appUser.id,
    name: defaultString(appUser.name),
    picture: defaultString(appUser.picture),
  };
  const following = await selectCountFollowing(params.userId);
  const followers = await selectCountFollower(params.userId);

  const isFollowing = await (async () => {
    const googleUser = await getGoogleUser(request, response);
    if (googleUser) {
      const loginUser = await selectUserByGoogleId(googleUser.id);
      if (loginUser) {
        return await judgeFollowing({
          userId: loginUser.id,
          followingUserId: params.userId,
        });
      }
    }
    return false;
  })();

  response.json({ user, following, followers, isFollowing });
};
