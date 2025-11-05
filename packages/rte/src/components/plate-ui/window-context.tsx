"use client";

import { createContext, useContext } from "react";

export const WindowContext = createContext<Window | null | undefined>(
  undefined,
);

export const useWindow = () => {
  const contextWindow = useContext(WindowContext);
  return contextWindow ?? globalThis.window;
};
