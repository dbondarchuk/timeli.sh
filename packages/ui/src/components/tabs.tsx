"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import React, { useCallback } from "react";

import { ViewIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type RegisteredTab = {
  value: string;
  node: React.ReactNode;
  className?: string;
  onSelect?: () => void;
};

const Tabs = TabsPrimitive.Root;
type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  registerTrigger: (tab: RegisteredTab) => void;
  unregisterTrigger: (value: string) => void;
  triggers: RegisteredTab[];
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("useTabsContext must be used inside <TabsRoot>");
  }
  return ctx;
}

const TabsRoot = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs>
>(
  (
    { value: controlledValue, defaultValue, onValueChange, children, ...props },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue ?? "",
    );

    const value = controlledValue ?? uncontrolledValue;

    const setValue = React.useCallback(
      (next: string) => {
        if (controlledValue === undefined) {
          setUncontrolledValue(next);
        }
        onValueChange?.(next);
      },
      [controlledValue, onValueChange],
    );

    const [triggers, setTriggers] = React.useState<RegisteredTab[]>([]);

    const registerTrigger = React.useCallback((tab: RegisteredTab) => {
      setTriggers((prev) =>
        prev.some((t) => t.value === tab.value) ? prev : [...prev, tab],
      );
    }, []);

    const unregisterTrigger = React.useCallback((value: string) => {
      setTriggers((prev) => prev.filter((t) => t.value !== value));
    }, []);

    return (
      <TabsContext.Provider
        value={{
          value,
          setValue,
          registerTrigger,
          unregisterTrigger,
          triggers,
        }}
      >
        <Tabs value={value} onValueChange={setValue} {...props}>
          {children}
        </Tabs>
      </TabsContext.Provider>
    );
  },
);
TabsRoot.displayName = TabsPrimitive.Tabs.displayName;

const TabsViaUrl = React.forwardRef<
  React.ElementRef<typeof TabsRoot>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs> & {
    usePath?: string;
  }
>(({ defaultValue, usePath, onValueChange, ...props }, ref) => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab") || defaultValue;
  const router = useRouter();

  const onChange = useCallback(
    (value: string) => {
      onValueChange?.(value);
      if (usePath) {
        router.push(`${usePath}/${encodeURIComponent(value)}`);
      } else {
        router.push(`?activeTab=${encodeURIComponent(value)}`);
      }
    },
    [usePath, onValueChange, router],
  );

  return (
    <TabsRoot ref={ref} value={activeTab} onValueChange={onChange} {...props} />
  );
});

TabsViaUrl.displayName = TabsPrimitive.Tabs.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md bg-card border p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTriggerBase = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTriggerBase>,
  React.ComponentPropsWithoutRef<typeof TabsTriggerBase>
>(({ className, value, children, ...props }, ref) => {
  const { registerTrigger, unregisterTrigger } = useTabsContext();

  React.useEffect(() => {
    registerTrigger({ value, node: children, className });
    return () => unregisterTrigger(value);
  }, [value, children, registerTrigger, unregisterTrigger, className]);

  return (
    <TabsTriggerBase value={value} ref={ref} className={className} {...props}>
      {children}
    </TabsTriggerBase>
  );
});

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

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

interface ResponsiveTabsListProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
}

const ResponsiveTabsList = ({
  children,
  className,
  mobileClassName,
}: ResponsiveTabsListProps) => {
  const { value, setValue, triggers } = useTabsContext();

  const selectedTrigger = triggers.find((tab) => tab.value === value);

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger
            className={cn("w-full flex flex-row gap-2", mobileClassName)}
          >
            <ViewIcon className="size-3" />
            <SelectValue asChild>
              <div className="flex">
                <div
                  className={cn(
                    "inline-flex items-center [&_svg]:size-3",
                    selectedTrigger?.className,
                  )}
                >
                  {selectedTrigger?.node}
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {triggers.map((tab) => (
              <SelectItem key={tab.value} value={tab.value} className="w-full">
                <div
                  className={cn(
                    "inline-flex items-center [&_svg]:size-3",
                    tab.className,
                  )}
                >
                  {tab.node}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop */}
      <TabsList className={`hidden md:inline-flex ${className ?? ""}`}>
        {children}
      </TabsList>
    </>
  );
};
ResponsiveTabsList.displayName = TabsPrimitive.List.displayName;

export {
  ResponsiveTabsList,
  TabsRoot as Tabs,
  // Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsViaUrl,
};
