import type { APIHandler } from "aleph/types.d.ts";
import { getAuthUrl, getGoogleUser, GoogleUser } from "~/lib/auth.ts";
import { selectUserByGoogleId, upsertUser, updateUser } from "~/lib/db.ts";
import { LoginUser } from "~/lib/types.ts";

type ResponseType = {
  loginUser?: LoginUser;
  authUrl?: string;
}

export const handler: APIHandler = async ({ request, response }) => {
  console.log(request.url);

  const googleUser = await getGoogleUser(request, response);
  if (googleUser) {
    const appId = await getAppId(googleUser);
    const loginUser: LoginUser = {
      appId,
      googleId: googleUser.id,
      name: googleUser.name,
      picture: googleUser.picture,
    };
    const responseJson: ResponseType = { loginUser };
    response.json(responseJson);
    return;
  }

  const authUrl = getAuthUrl(request.url);
  const responseJson: ResponseType = { authUrl };
  response.json(responseJson);
};

async function getAppId(googleUser: GoogleUser): Promise<number> {
  const user = await selectUserByGoogleId(googleUser.id);
  if (user) {
    if (user.name !== googleUser.name || user.picture !== googleUser.picture) {
      await updateUser({id: user.id, name: googleUser.name, picture: googleUser.picture});
    }
    return user.id;
  }
  return await upsertUser({
    googleId: googleUser.id,
    name: googleUser.name,
    picture: googleUser.picture,
  });
}
