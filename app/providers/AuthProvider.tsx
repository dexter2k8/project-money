import { createContext, useContext } from "react";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { PropsWithChildren } from "react";
import type { KeyedMutator } from "swr";
import type { IUser } from "../api/auth/get-self-user/types";

interface IAuthContextData {
  selfUser?: IUser | null;
  mutate: KeyedMutator<IUser>;
}

const AuthContext = createContext<IAuthContextData | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { response: selfUser, mutate } = useSWR<IUser>(API.AUTH.GET_SELF_USER);

  return <AuthContext.Provider value={{ selfUser, mutate }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
