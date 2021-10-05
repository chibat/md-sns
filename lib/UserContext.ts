import { createContext } from "react";
import { LoginUser } from "~/lib/types.ts";

export const UserContext = createContext<LoginUser | undefined>(undefined);
