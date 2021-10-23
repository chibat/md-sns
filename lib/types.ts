import type { Post } from "~/lib/db.ts";

export type LoginUser = {
  userId: number;
  name: string;
  picture: string;
  notification: boolean;
}

export type User = {
  userId: number;
  name: string;
  picture: string
}

export type ResponsePost = Post & { liked: boolean };

