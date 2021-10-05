
export type LoginUser = {
  appId: number;
  googleId: string;
  name: string;
  picture: string
}

export type Post = {
  id: number;
  userId: number;
  name: string;
  source: string;
  picture?: string;
  updatedAt: string;
};

