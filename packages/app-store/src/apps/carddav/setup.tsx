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
import { CarddavConfiguration, carddavConfigurationSchema } from "./models";
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
    const fetchUrl = async () => {
      if (!existingAppId) return;

      try {
        // Get app data to extract companyId
        const appData = await adminApi.apps.getAppData(existingAppId);
        const companyId = appData?.companyId;

        if (companyId) {
          // Use the external server port (default 5556)
          const externalServerPort =
            process.env.NEXT_PUBLIC_APP_EXTERNAL_SERVER_PORT || "5556";
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          const url = `${protocol}//${hostname}:${externalServerPort}/api/apps/${companyId}/${existingAppId}/addressbook/`;
          setCarddavUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch app data for URL", error);
      }
    };

    fetchUrl();
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
