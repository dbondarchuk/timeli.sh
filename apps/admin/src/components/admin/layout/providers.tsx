"use client";
import { NavigationGuardProvider } from "next-navigation-guard";
import React from "react";
import ThemeProvider from "./theme-toggle/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NavigationGuardProvider>{children}</NavigationGuardProvider>
      </ThemeProvider>
    </>
  );
}
