
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

export type Post = {
  id: number;
  userId: number;
  name: string;
  source: string;
  picture?: string;
  updatedAt: string;
};

