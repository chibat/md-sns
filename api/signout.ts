import { deleteCookie, getCookies } from "std/http/cookie.ts";
import { revoke } from "~/lib/auth.ts";

import type { APIHandler } from "aleph/types.d.ts";

export const handler: APIHandler = async ({ response, request }) => {
  console.log(request.url);
  const cookies = getCookies(request.headers);
  const accessToken = cookies["access"];
  if (accessToken) {
    await revoke(accessToken);
  }
  deleteCookie(response.headers, "access");
  deleteCookie(response.headers, "refresh");
  response.redirect("/");
};
