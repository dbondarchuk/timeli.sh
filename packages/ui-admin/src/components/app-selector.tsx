"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { AppScope, ConnectedApp } from "@timelish/types";
import {
  cn,
  Combobox,
  ComboboxProps,
  IComboboxItem,
  toast,
} from "@timelish/ui";
import React from "react";
import {
  ConnectedAppAccount,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "./connected-app-properties";

const AppShortLabel: React.FC<{ app: ConnectedApp }> = ({ app }) => {
  return (
    <span className="flex flex-row items-center gap-2 shrink overflow-hidden text-nowrap min-w-0 max-w-[var(--radix-popover-trigger-width)]">
      <ConnectedAppNameAndLogo appName={app.name} logoClassName="size-3.5" />
      <ConnectedAppAccount account={app.account} />
    </span>
  );
};

const checkAppSearch = (app: ConnectedApp, query: string) => {
  const search = query.toLocaleLowerCase();
  return (
    app.name.toLocaleLowerCase().includes(search) ||
    app.account?.username?.toLocaleLowerCase().includes(search) ||
    (app.account as any)?.serverUrl?.toLocaleLowerCase().includes(search) ||
    app.account?.additional?.toLocaleLowerCase().includes(search)
  );
};

type BaseAppSelectorProps = {
  placeholder?: string;
  scope: AppScope;
  value?: string;
  disabled?: boolean;
  className?: string;
  excludeIds?: string[];
  setAppName?: (appName?: string) => void;
  size?: ComboboxProps["size"];
};

type ClearableAppSelectorProps = {
  onItemSelect?: (value: string | undefined) => void;
  allowClear: true;
};

type NonClearableAppSelectorProps = {
  onItemSelect?: (value: string) => void;
  allowClear?: false;
};

export type AppSelectorProps = BaseAppSelectorProps &
  (ClearableAppSelectorProps | NonClearableAppSelectorProps);

export const AppSelector: React.FC<AppSelectorProps> = ({
  scope,
  placeholder,
  disabled,
  className,
  excludeIds,
  value,
  onItemSelect,
  allowClear,
  setAppName,
  size,
}) => {
  const [apps, setApps] = React.useState<ConnectedApp[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const t = useI18n("apps");

  React.useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const apps = await adminApi.apps.getAppsByScope(scope);
        setApps(apps);
      } catch (e) {
        toast.error(t("common.requestFailed"));
        console.error(e);
        setApps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fn();
  }, [scope]);

  React.useEffect(() => {
    setAppName?.(apps?.find((app) => app._id === value)?.name);
  }, [apps, value]);

  const appValues = (apps: ConnectedApp[]): IComboboxItem[] =>
    apps
      .filter(({ _id }) => !excludeIds?.find((id) => id === _id))
      .map((app) => {
        return {
          value: app._id,
          shortLabel: <AppShortLabel app={app} />,
          label: (
            <div className="flex flex-col gap-2">
              <AppShortLabel app={app} />
              <ConnectedAppStatusMessage
                status={app.status}
                statusText={app.statusText}
              />
            </div>
          ),
        };
      });

  return (
    // @ts-ignore Allow clear passthrough
    <Combobox
      allowClear={allowClear}
      size={size}
      disabled={disabled || isLoading}
      className={cn("flex font-normal text-base max-w-full", className)}
      values={appValues(apps)}
      searchLabel={
        isLoading
          ? t("common.loadingApps")
          : placeholder || t("common.selectApp")
      }
      value={value}
      customSearch={(search) =>
        appValues(apps.filter((app) => checkAppSearch(app, search)))
      }
      onItemSelect={onItemSelect}
    />
  );
};
