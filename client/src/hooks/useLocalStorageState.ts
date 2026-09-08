import { useCallback, useState } from "react";
import { logger } from "../lib/logger";

function readValue<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);

    return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => readValue(key, defaultValue));

  const setAndPersist = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev) // Calls the fn newValue with prev as the arg
            : newValue;

        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          logger.warn("localStorage unavailable");
        }

        return resolved;
      });
    },
    [key],
  );

  return [value, setAndPersist] as const;
}
