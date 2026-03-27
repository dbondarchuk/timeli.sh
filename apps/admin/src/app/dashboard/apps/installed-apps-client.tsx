"use client";

import { ConnectedAppRow } from "@/components/admin/apps/connected-app";
import { AvailableApps } from "@timelish/app-store";
import { useI18n } from "@timelish/i18n";
import { ConnectedApp } from "@timelish/types";
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupAddonClasses,
  InputGroupInput,
  InputGroupInputClasses,
} from "@timelish/ui";
import { Search, X } from "lucide-react";
import React from "react";

type InstalledAppsClientProps = {
  apps: ConnectedApp[];
};

export const InstalledAppsClient: React.FC<InstalledAppsClientProps> = ({
  apps,
}) => {
  const tApps = useI18n("apps");
  const [search, setSearch] = React.useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredApps = React.useMemo(() => {
    if (!normalizedSearch) return apps;

    return apps.filter((app) => {
      const descriptor = AvailableApps[app.name];
      const translatedName = descriptor
        ? tApps(descriptor.displayName as any).toLowerCase()
        : "";
      const internalName = app.name.toLowerCase();

      return (
        internalName.includes(normalizedSearch) ||
        translatedName.includes(normalizedSearch)
      );
    });
  }, [apps, normalizedSearch, tApps]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex justify-end">
        <InputGroup className="w-full md:max-w-sm">
          <InputGroupAddon
            className={InputGroupAddonClasses({ variant: "prefix", h: "sm" })}
          >
            <Search className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setSearch("");
                }
              }}
              h="sm"
              placeholder={tApps("installedApps.searchPlaceholder")}
              className={InputGroupInputClasses({ variant: "both" })}
            />
          </InputGroupInput>
          <InputGroupAddon
            className={InputGroupAddonClasses({ variant: "suffix", h: "sm" })}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              disabled={!search}
              aria-label="Clear search"
              className="size-7"
            >
              <X className="size-3.5" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
      {filteredApps.map((app) => (
        <ConnectedAppRow app={app} key={app._id} />
      ))}
      {apps.length === 0 && (
        <div className="rounded-lg border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          {tApps("installedApps.noInstalledApps")}
        </div>
      )}
      {apps.length > 0 && filteredApps.length === 0 && (
        <div className="rounded-lg border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          {tApps("installedApps.noResults")}
        </div>
      )}
    </div>
  );
};
