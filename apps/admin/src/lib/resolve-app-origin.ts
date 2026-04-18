import { headers } from "next/headers";

/** Public origin for redirects (Polar checkout, customer portal, etc.). */
export async function resolveAppOrigin(): Promise<string> {
  const fromEnv =
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.ADMIN_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
