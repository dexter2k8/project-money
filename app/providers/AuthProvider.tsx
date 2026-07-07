"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { response: selfUser, mutate, isLoading } = useSWR<IUser>(API.AUTH.GET_SELF_USER);

  const hasCheckedRef = useRef(false);

  // redirect to last page accessed after login
  useEffect(() => {
    if (isLoading) return;
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
    }
    if (selfUser !== undefined) return;
    const query = searchParams.toString();
    const returnTo = encodeURIComponent(pathname + (query ? `?${query}` : ""));
    router.replace(`/?returnTo=${returnTo}`);
  }, [isLoading, selfUser, pathname, searchParams, router]);

  const values = { selfUser, mutate };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
