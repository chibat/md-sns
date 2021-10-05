import type { APIHandler } from "aleph/types.d.ts";
import { getCode, getTokenByCode, getCallbackUrl } from "~/lib/auth.ts";
import { clientId, clientSecret } from "~/lib/env.ts";
import { setCookie } from "std/http/cookie.ts";

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);
  const code = getCode(request.url);
  if (code) {
    const redirectUri = getCallbackUrl(request.url);
    const { access_token, refresh_token } = await getTokenByCode(
      clientId,
      clientSecret,
      redirectUri,
      code,
    );
    if (access_token) {
      setCookie(response.headers, {
        name: "access",
        value: access_token,
        sameSite: "Strict",
        httpOnly: true,
        secure: true,
      });
    }
    if (refresh_token) {
      setCookie(response.headers, {
        name: "refresh",
        value: refresh_token,
        sameSite: "Strict",
        httpOnly: true,
        secure: true,
      });
    }
  }
  response.redirect("/");
};
