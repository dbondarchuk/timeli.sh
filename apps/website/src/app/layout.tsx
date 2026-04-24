import { SonnerToaster } from "@timelish/ui";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "timeli.sh — All-in-One Appointment Scheduling Platform",
  description:
    "The all-in-one appointment scheduling platform that helps you manage bookings, communicate with clients, and grow your business—all from one beautiful interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
        <SonnerToaster />
      </body>
    </html>
  );
}
