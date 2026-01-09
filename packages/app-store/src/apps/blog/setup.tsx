"use client";

import { useI18n } from "@timelish/i18n";
import { AppSetupProps } from "@timelish/types";
import {
  Button,
  Form,
  Spinner,
} from "@timelish/ui";
import {
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "@timelish/ui-admin";
import React from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { BlogApp } from "./app";
import { blogConfigurationSchema, BlogConfiguration } from "./models";
import {
  BlogAdminKeys,
  BlogAdminNamespace,
  blogAdminNamespace,
} from "./translations/types";

export const BlogAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<BlogConfiguration>({
      appId: existingAppId,
      appName: BlogApp.name,
      schema: blogConfigurationSchema,
      onSuccess,
      onError,
      initialData: {},
      processDataForSubmit: (data) => ({
        type: "set-configuration",
        configuration: data,
      }),
    });

  const t = useI18n<BlogAdminNamespace, BlogAdminKeys>(
    blogAdminNamespace,
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !isValid}
              className="inline-flex gap-2 items-center w-full"
            >
              {isLoading && <Spinner />}
              <span className="inline-flex gap-2 items-center">
                {t.rich("setup.update", {
                  app: () => (
                    <ConnectedAppNameAndLogo
                      appName={BlogApp.name}
                      logoClassName="w-4 h-4"
                    />
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

