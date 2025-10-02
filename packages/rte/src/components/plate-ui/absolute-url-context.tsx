"use client";

import { createContext, useContext } from "react";

export const AbsoluteUrlContext = createContext<boolean>(false);

export const useAbsoluteUrl = () => {
  const contextAbsoluteUrl = useContext(AbsoluteUrlContext);
  return contextAbsoluteUrl ?? false;
};
