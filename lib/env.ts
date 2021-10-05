let _clientId = Deno.env.get("APP_AUTH_CLIENT_ID");
if (!_clientId) {
  Deno.exit(1);
}

let _clientSecret = Deno.env.get("APP_AUTH_CLIENT_SECRET");
if (!_clientSecret) {
  Deno.exit(2);
}

export const clientId = _clientId;
export const clientSecret = _clientSecret;
