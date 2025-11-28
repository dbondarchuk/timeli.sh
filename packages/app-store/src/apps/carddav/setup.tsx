"use client";

import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import { AppSetupProps } from "@timelish/types";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  Spinner,
} from "@timelish/ui";
import {
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "@timelish/ui-admin";
import React from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { CarddavApp } from "./app";
import { CARDDAV_APP_NAME } from "./const";
import {
  carddavConfigurationSchema,
  CarddavConfiguration,
} from "./models";
import {
  CarddavAdminKeys,
  carddavAdminNamespace,
  CarddavAdminNamespace,
} from "./translations/types";

export const CarddavAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const { appStatus, form, isLoading, setIsLoading, isValid, onSubmit } =
    useConnectedAppSetup<CarddavConfiguration>({
      appId: existingAppId,
      appName: CarddavApp.name,
      schema: carddavConfigurationSchema,
      onSuccess,
      onError,
      processDataForSubmit: (data) => data,
    });

  const t = useI18n<CarddavAdminNamespace, CarddavAdminKeys>(
    carddavAdminNamespace,
  );

  const [carddavUrl, setCarddavUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (existingAppId) {
      // Get the base URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/apps/${existingAppId}/addressbook/`;
      setCarddavUrl(url);
    }
  }, [existingAppId]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("form.username.label")}
                    <InfoTooltip>{t("form.username.tooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("form.password.label")}
                    <InfoTooltip>{t("form.password.tooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {carddavUrl && (
              <div className="w-full p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  {t.rich("form.info", {
                    url: () => (
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {carddavUrl}
                      </code>
                    ),
                  })}
                </p>
              </div>
            )}
            <Button
              disabled={isLoading || !isValid}
              type="submit"
              variant="default"
              className="inline-flex gap-2 items-center w-full"
            >
              {isLoading && <Spinner />}
              <span className="inline-flex gap-2 items-center">
                {t.rich("form.connect", {
                  app: () => (
                    <ConnectedAppNameAndLogo appName={CarddavApp.name} />
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

