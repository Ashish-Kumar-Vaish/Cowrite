import { type ComponentType } from "react";

export function lazyImport<
  T extends Record<string, unknown>,
  K extends keyof T,
>(factory: () => Promise<T>, name: K) {
  return async () => {
    const module = await factory();

    // Extract the requested named export as a React component
    return { Component: module[name] as ComponentType };
  };
}
