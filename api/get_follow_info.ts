import type { APIHandler } from "aleph/types.d.ts";
import {
  judgeFollowing,
  selectCountFollower,
  selectCountFollowing,
  selectUserByGoogleId,
} from "~/lib/db.ts";
import { getGoogleUser } from "~/lib/auth.ts";

export type RequestType = { userId: number };
export type ResponseType = {
  following: string;
  followers: string;
  isFollowing: boolean;
};

export const handler: APIHandler = async ({ request, response }) => {
  const params: RequestType = await request.json();
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

  response.json({ following, followers, isFollowing });
};
