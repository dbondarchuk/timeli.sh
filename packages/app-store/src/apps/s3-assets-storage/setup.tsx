"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  Spinner,
} from "@vivid/ui";
import {
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
} from "@vivid/ui-admin";
import React from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { S3AssetsStorageApp } from "./app";
import { S3Configuration, s3ConfigurationSchema } from "./models";
import {
  S3AssetsStorageAdminKeys,
  S3AssetsStorageAdminNamespace,
  s3AssetsStorageAdminNamespace,
} from "./translations/types";

export const S3AssetsStorageAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId,
}) => {
  const t = useI18n<S3AssetsStorageAdminNamespace, S3AssetsStorageAdminKeys>(
    s3AssetsStorageAdminNamespace,
  );

  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<S3Configuration>({
      appId,
      appName: S3AssetsStorageApp.name,
      schema: s3ConfigurationSchema,
      onSuccess,
      onError,
    });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("form.region.label")}{" "}
                    <InfoTooltip>{t("form.region.tooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.region.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessKeyId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.accessKeyId.label")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder={t("form.accessKeyId.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretAccessKey"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("form.secretAccessKey.label")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder={t("form.secretAccessKey.placeholder")}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("form.endpoint.label")}{" "}
                    <InfoTooltip>{t("form.endpoint.tooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.endpoint.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bucket"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("form.bucket.label")}{" "}
                    <InfoTooltip>{t("form.bucket.tooltip")}</InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.bucket.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="forcePathStyle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex flex-row gap-2 items-center">
                    <Checkbox
                      id="forcePathStyle"
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={(e) => {
                        field.onChange(!!e);
                        field.onBlur();
                      }}
                    />
                    <FormLabel
                      htmlFor="forcePathStyle"
                      className="cursor-pointer"
                    >
                      {t("form.forcePathStyle.label")}{" "}
                      <InfoTooltip>
                        {t("form.forcePathStyle.tooltip")}
                      </InfoTooltip>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
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
                    <ConnectedAppNameAndLogo
                      appName={S3AssetsStorageApp.name}
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
