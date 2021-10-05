import type { APIHandler } from "aleph/types.d.ts";
import { selectUser } from "~/lib/db.ts";
import type { AppUser } from "~/lib/db.ts";

export type RequestType = { userId: number };
export type ResponseType = AppUser | null;

export const handler: APIHandler = async ({request, response}) => {
  const params: RequestType = await request.json();
  const result: ResponseType = await selectUser(params.userId);
  response.json(result);
};


