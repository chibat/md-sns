// React の依存がないファイルにする
import type { APIResponse } from "aleph/types.d.ts";
import { getCookies, setCookie } from "std/http/cookie.ts";
import { clientId, clientSecret } from "~/lib/env.ts";
import { LoginUser } from "~/lib/types.ts";

const CALL_BACK_PATH = "/api/callback";

export type Token = { access_token: string; refresh_token: string };

export type GoogleUser = {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export type AuthInfo = {
  loginUser?: LoginUser;
  authUrl?: string;
};

export function getCallbackUrl(requestUrl: string) {
  console.log(`${requestUrl} requestUrl`);
  const url = new URL(requestUrl);
  return url.protocol + "//" + url.host + CALL_BACK_PATH;
}

export function getAuthUrl(requestUrl: string): string {
  const redirectUri = getCallbackUrl(requestUrl);
  return "https://accounts.google.com/o/oauth2/auth?" +
    new URLSearchParams([
      ["client_id", clientId],
      ["redirect_uri", redirectUri],
      ["scope", "https://www.googleapis.com/auth/userinfo.profile"],
      ["access_type", "offline"],
      ["response_type", "code"],
    ]).toString();
}

export async function getTokenByCode(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
): Promise<Token> {
  const response = await fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([
      ["client_id", clientId],
      ["client_secret", clientSecret],
      ["redirect_uri", redirectUri],
      ["grant_type", "authorization_code"],
      ["code", code],
    ]),
  });

  const json: Token = await response.json();
  return json;
}

export async function getTokenByRefreshToken(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  refreshToken: string,
): Promise<Token> {
  const response = await fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([
      ["client_id", clientId],
      ["client_secret", clientSecret],
      ["redirect_uri", redirectUri],
      ["grant_type", "refresh_token"],
      ["refresh_token", refreshToken],
    ]),
  });

  const json = await response.json();
  return json;
}

export async function getUserByAccessToken(accessToken: string): Promise<GoogleUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?" +
      new URLSearchParams([["access_token", accessToken]]),
  );
  const json = await response.json();
  if (response.status === 200) {
    return json;
  }
  throw new Error(JSON.stringify(json));
}

export async function revoke(accessToken: string): Promise<void> {
  await fetch(
    "https://accounts.google.com/o/oauth2/revoke?" +
      new URLSearchParams([["token", accessToken]]),
  );
}

export function getCode(url: string) {
  return new URL(url).searchParams.get("code");
}

export async function getGoogleUser(request: Request, response: APIResponse): Promise<GoogleUser | null> {
  const cookies = getCookies(request.headers);
  const accessToken = cookies["access"];
  if (accessToken) {
    try {
      const googleUser = await getUserByAccessToken(accessToken);
      if (googleUser) {
        return googleUser;
      }
    } catch (ignore) {
    }
  }
  const refreshToken = cookies["refresh"];
  if (refreshToken) {
    console.log("refresh token");
    const redirectUri = getCallbackUrl(request.url);
    const { access_token } = await getTokenByRefreshToken(
      clientId,
      clientSecret,
      redirectUri,
      refreshToken,
    );
    if (access_token) {
      setCookie(response.headers, {
        name: "access",
        value: access_token,
        sameSite: "Strict",
        httpOnly: true,
        secure: true,
      });
      const googleUser = await getUserByAccessToken(access_token);
      if (googleUser) {
        return googleUser;
      }
    }
  }
  return null;
}
