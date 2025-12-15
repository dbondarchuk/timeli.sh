"use client";

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Link,
} from "@timelish/ui";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Integrations", href: "#integrations" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminUrl = `https://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex md:flex-1">
          <NextLink href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Timeli.sh
            </span>
          </NextLink>
        </div>
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden md:flex md:gap-x-10">
          {navigation.map((item) => (
            <NextLink
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </NextLink>
          ))}
        </div>
        <div className="hidden md:flex md:flex-1 md:justify-end md:gap-x-4">
          <Link href={adminUrl} variant="ghost" size="sm" button>
            Log in
          </Link>
          <Link size="sm" variant="brand" href="#waitlist" button>
            Join the waitlist
          </Link>
        </div>
      </nav>

      <Drawer
        direction="right"
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      >
        <DrawerContent className="bg-background flex flex-col  h-full min-w-[100px] max-w-fit mt-24 fixed bottom-0 right-0 left-auto rounded-none">
          <DrawerHeader className="flex flex-row gap-2 items-center">
            <DrawerTitle className="text-base flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Timeli.sh
              </span>
            </DrawerTitle>
            <DrawerClose asChild className="">
              <Button
                variant="ghost"
                size="icon"
                className="w-fit ml-auto"
                aria-label="Close menu"
              >
                <X />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="w-full py-6 px-4">
            <nav className="flex flex-col gap-3 items-end">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <NextLink
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </NextLink>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  <Link
                    href={adminUrl}
                    variant="outline"
                    className="w-full bg-transparent"
                    button
                  >
                    Log in
                  </Link>
                  <Link href="#waitlist" button className="w-full">
                    Join the waitlist
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
}
