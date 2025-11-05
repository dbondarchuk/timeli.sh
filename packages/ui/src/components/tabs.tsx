"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import React from "react";

import { useSearchParams } from "next/navigation";
import { cn } from "../utils";
import { Link } from "./link";

const Tabs = TabsPrimitive.Root;

const TabsViaUrl = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs>
>(({ defaultValue, ...props }, ref) => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab") || defaultValue;

  return <TabsPrimitive.Tabs ref={ref} defaultValue={activeTab} {...props} />;
});
TabsViaUrl.displayName = TabsPrimitive.Tabs.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-card border p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsLinkTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  usePath?: string;
}> = ({ value, children, usePath }) => (
  <TabsTrigger value={value} asChild>
    <Link
      href={
        usePath
          ? `${usePath}/${encodeURIComponent(value)}`
          : `?activeTab=${encodeURIComponent(value)}`
      }
      className="text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    >
      {children}
    </Link>
  </TabsTrigger>
);
TabsLinkTrigger.displayName = "TabsLinkTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  Tabs,
  TabsContent,
  TabsLinkTrigger,
  TabsList,
  TabsTrigger,
  TabsViaUrl,
};
