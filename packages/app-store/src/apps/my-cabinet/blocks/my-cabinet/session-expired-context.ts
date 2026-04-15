"use client";

import { createContext, useContext } from "react";

export const SessionExpiredContext = createContext<() => void>(() => {});

export const useOnSessionExpired = () => useContext(SessionExpiredContext);
