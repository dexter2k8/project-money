import { createContext, useContext, useState } from "react";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { PropsWithChildren } from "react";
import type { KeyedMutator } from "swr";
import type { IUser } from "../api/auth/get-self-user/types";
import type { TGetBankResponse } from "../api/types";

interface IAuthContextData {
  selfUser?: IUser | null;
  mutate: KeyedMutator<IUser>;
  bank?: TGetBankResponse | null;
  setBank: (bank: TGetBankResponse | null) => void;
}

const AuthContext = createContext<IAuthContextData | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [bank, setBank] = useState<TGetBankResponse | null>(null);
  const { response: selfUser, mutate } = useSWR<IUser>(API.AUTH.GET_SELF_USER);

  const values = { selfUser, mutate, bank, setBank };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
