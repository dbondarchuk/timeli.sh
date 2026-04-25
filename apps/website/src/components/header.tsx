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
import { getSignInUrl, getSignUpUrl } from "@/lib/admin-app-urls";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Integrations", href: "#integrations" },
  { name: "Pricing", href: "#pricing" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const signInUrl = getSignInUrl();
  const signUpUrl = getSignUpUrl();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex md:flex-1">
          <NextLink href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              timeli<span className="text-primary">.sh</span>
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
          <Link href={signInUrl} variant="ghost" size="sm" button>
            Log in
          </Link>
          <Link size="sm" variant="brand" href={signUpUrl} button>
            Get started
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                <Image src="/logo.png" alt="Timeli.sh" width={36} height={36} />
              </div>
              <span className="text-3xl font-bold tracking-tight">
                timeli<span className="text-primary">.sh</span>
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
                    href={signInUrl}
                    variant="outline"
                    className="w-full bg-transparent"
                    button
                  >
                    Log in
                  </Link>
                  <Link href={signUpUrl} button className="w-full">
                    Get started
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
