"use client";
import React from "react";
import { CookiesProvider as BaseCookiesProvider } from "react-cookie";

export const CookiesProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => <BaseCookiesProvider>{children}</BaseCookiesProvider>;
