"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  Button,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vivid/ui";
import React from "react";
import { LogCleanupApp } from "./app";
import {
  CleanUpIntervalType,
  LogCleanupConfiguration,
  logCleanupConfigurationSchema,
} from "./models";
import {
  LogCleanupAdminKeys,
  LogCleanupAdminNamespace,
  logCleanupAdminNamespace,
} from "./translations/types";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@vivid/ui";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";

export const LogCleanupAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const t = useI18n<LogCleanupAdminNamespace, LogCleanupAdminKeys>(
    logCleanupAdminNamespace,
  );

  const intervalTypeLabels: Record<CleanUpIntervalType, string> = {
    days: t("intervals.days"),
    weeks: t("intervals.weeks"),
    months: t("intervals.months"),
  };

  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<LogCleanupConfiguration>({
      appId: existingAppId,
      appName: LogCleanupApp.name,
      schema: logCleanupConfigurationSchema,
      onSuccess,
      onError,
    });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-full gap-2 flex flex-col md:grid md:grid-cols-2 md:gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.amount.label")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        placeholder={t("form.amount.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.type.label")}</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          field.onBlur();
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("form.type.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(intervalTypeLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !isValid}
              className="inline-flex gap-2 items-center w-full"
            >
              {isLoading && <Spinner />}
              <span className="inline-flex gap-2 items-center">
                {t.rich(existingAppId ? "form.update" : "form.add", {
                  app: () => (
                    <ConnectedAppNameAndLogo appName={LogCleanupApp.name} />
                  ),
                })}
              </span>
            </Button>
          </div>
        </form>
      </Form>
      {appStatus && (
        <ConnectedAppStatusMessage
          status={appStatus.status}
          statusText={appStatus.statusText}
        />
      )}
    </>
  );
};
