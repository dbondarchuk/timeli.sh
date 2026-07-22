"use client";

import { usePathname } from "next/navigation";

/** Hides children on the dashboard home route so the page greeting can lead. */
export function HeaderHomeAware({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/dashboard") {
    return null;
  }
  return <>{children}</>;
}
