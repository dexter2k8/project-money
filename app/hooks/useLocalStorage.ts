import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      setValue(e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  const setStoredValue = useCallback(
    (newValue: T | null) => {
      if (newValue === null) {
        setValue(initialValue);
        localStorage.removeItem(key);
      } else {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    },
    [key, initialValue],
  );

  return [value, setStoredValue] as const;
}
