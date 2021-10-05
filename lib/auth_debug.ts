import { clientId, clientSecret } from "./env.ts";
import { getAuthUrl, getCode, getTokenByCode, getUserByAccessToken } from "./auth.ts";

if (import.meta.main) {
  const redirectUri = "http://localhost:8080/api/callback";
  const url = getAuthUrl(redirectUri);

  console.log(url);
  console.log("click!");

  const callbackUrl = prompt("callback url>");
  if (!callbackUrl) {
    Deno.exit(1);
  }

  const code = getCode(callbackUrl);
  console.log(code);
  if (!code) {
    Deno.exit(2);
  }

  const token = await getTokenByCode(
    clientId,
    clientSecret,
    redirectUri,
    code,
  );
  const googleUser = await getUserByAccessToken(token.access_token);
  console.log(googleUser);
}
