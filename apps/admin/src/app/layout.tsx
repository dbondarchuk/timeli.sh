import Providers from "@/components/admin/layout/providers";
import { SonnerToaster } from "@timelish/ui";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Cormorant_Garamond, Karla } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const dynamic = "force-dynamic";

/** UI / body — Karla is the sans-serif face. */
const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

/** Display headings — Cormorant Garamond is the serif face. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | timeli.sh",
  },
  icons: {
    icon: "/icon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${karla.variable} ${cormorant.variable} font-sans overflow-hidden`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <NextTopLoader showSpinner={false} color="hsl(var(--primary))" />
          <Providers>
            <SonnerToaster richColors position="top-right" />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
