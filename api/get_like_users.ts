import { selectLikeUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";

import type { APIHandler } from "aleph/types.d.ts";
import type { User } from "~/lib/types.ts";

export type RequestType = { postId: number };
export type ResponseType = Array<User>;

export const handler: APIHandler = async ({ request, response }) => {
  console.log(request.url);
  const params: RequestType = await request.json();
  const results = (await selectLikeUsers(params.postId)).map(
    (appUser): User => {
      return {
        userId: appUser.id,
        name: defaultString(appUser.name),
        picture: defaultString(appUser.picture),
      };
    },
  );
  response.json(results);
};
