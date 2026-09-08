import { useEffect, useRef } from "react";
import { debounce } from "../lib/debounce";

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): T {
  const fnRef = useRef(fn);

  useEffect(() => {
    // Keep the latest function without recreating the debounced callback
    fnRef.current = fn;
  }, [fn]);

  const debouncedRef = useRef<T | null>(null);

  if (!debouncedRef.current) {
    // Create the debounced callback only once
    // when fn changes fnRef.current is updated so the debounced callback uses latest fn
    debouncedRef.current = debounce(
      ((...args: Parameters<T>) => fnRef.current(...args)) as T,
      delay,
    );
  }

  return debouncedRef.current;
}
