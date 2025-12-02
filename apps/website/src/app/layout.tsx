import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timeli.sh — All-in-One Appointment Scheduling Platform",
  description:
    "The all-in-one appointment scheduling platform that helps you manage bookings, communicate with clients, and grow your business—all from one beautiful interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased scroll-smooth`}>{children}</body>
    </html>
  );
}
