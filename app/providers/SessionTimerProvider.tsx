import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { RefreshSession, SignOut } from "../services/fetchers/auth";
import { setResetSessionTimer } from "../utils/sessionTimerBridge";
import type { PropsWithChildren } from "react";

const EXPIRING_SOON_THRESHOLD = 60; // 1 minute
const CHECK_INTERVAL = 1000; // 1 second

interface ISessionTimerContextProps {
  remainingSeconds: number;
  resetSession: () => void;
  refreshSession: () => Promise<void>;
  isExpiringSoon: boolean;
}

const SessionTimerContext = createContext<ISessionTimerContextProps | null>(null);

export function SessionTimerProvider({ children }: PropsWithChildren) {
  const { selfUser } = useAuth();
  const expiresAtRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSigningOutRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  const calculateRemaining = useCallback(() => {
    const diff = expiresAtRef.current - Date.now();
    return Math.max(Math.floor(diff / 1000), 0);
  }, []);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const resetSession = useCallback(() => {
    isSigningOutRef.current = false;
    setRemainingSeconds(calculateRemaining());
  }, [calculateRemaining]);

  const refreshSession = useCallback(async () => {
    const response = await RefreshSession();
    if (!response) return;
    expiresAtRef.current = response.exp * 1000;
    isSigningOutRef.current = false;
    setRemainingSeconds(calculateRemaining());
  }, [calculateRemaining]);

  const isExpiringSoon = remainingSeconds > 0 && remainingSeconds <= EXPIRING_SOON_THRESHOLD;

  const handleSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    const result = await SignOut();
    if (result) window.location.href = "/";
  }, []);

  // Sign out when session expires
  useEffect(() => {
    if (remainingSeconds === 0 && isInitializedRef.current) {
      handleSignOut();
    }
  }, [remainingSeconds, handleSignOut]);

  // Register session reset on bridge
  useEffect(() => {
    setResetSessionTimer(resetSession);
    return () => setResetSessionTimer(() => {});
  }, [resetSession]);

  // Update remaining seconds
  useEffect(() => {
    if (!selfUser?.exp) return;

    expiresAtRef.current = selfUser.exp * 1000;
    isInitializedRef.current = true;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(calculateRemaining());
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selfUser?.exp, calculateRemaining]);

  const values = { remainingSeconds, resetSession, refreshSession, isExpiringSoon };

  return <SessionTimerContext.Provider value={values}>{children}</SessionTimerContext.Provider>;
}

export const useSessionTimer = () => {
  const context = useContext(SessionTimerContext);
  if (!context) {
    throw new Error("useSessionTimer must be used within a SessionTimerProvider");
  }
  return context;
};
