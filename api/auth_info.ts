import type { APIHandler } from "aleph/types.d.ts";
import { getAuthUrl, getGoogleUser, GoogleUser } from "~/lib/auth.ts";
import { selectUserByGoogleId, upsertUser, updateUser, AppUser } from "~/lib/db.ts";
import { LoginUser } from "~/lib/types.ts";

export type ResponseType = {
  loginUser?: LoginUser;
  authUrl?: string;
}

export const handler: APIHandler = async ({ request, response }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (googleUser) {
    const user = await getUser(googleUser);
    const loginUser: LoginUser = {
      userId: user.id,
      name: googleUser.name,
      picture: googleUser.picture,
      notification: user.notification,
    };
    const responseJson: ResponseType = { loginUser };
    response.json(responseJson);
    return;
  }

  const authUrl = getAuthUrl(request.url);
  const responseJson: ResponseType = { authUrl };
  response.json(responseJson);
};

async function getUser(googleUser: GoogleUser): Promise<AppUser> {
  const user = await selectUserByGoogleId(googleUser.id);
  if (user) {
    if (user.name !== googleUser.name || user.picture !== googleUser.picture) {
      await updateUser({id: user.id, name: googleUser.name, picture: googleUser.picture});
    }
    return user;
  }
  return await upsertUser({
    googleId: googleUser.id,
    name: googleUser.name,
    picture: googleUser.picture,
  });
}
