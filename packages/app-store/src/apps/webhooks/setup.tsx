"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  Button,
  Checkbox,
  ConnectedAppNameAndLogo,
  ConnectedAppStatusMessage,
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
import React, { useState } from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { webhooksApp } from "./app";
import {
  MASKED_SECRET,
  webhookEventTypes,
  webhooksConfigurationSchema,
} from "./models";
import {
  WebhooksAdminKeys,
  WebhooksAdminNamespace,
  webhooksAdminNamespace,
} from "./translations/types";

export const WebhooksAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId,
}) => {
  const t = useI18n<WebhooksAdminNamespace, WebhooksAdminKeys>(
    webhooksAdminNamespace,
  );

  const [isEditingSecret, setIsEditingSecret] = useState(false);

  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<typeof webhooksConfigurationSchema._type>({
      appId,
      appName: webhooksApp.name,
      schema: webhooksConfigurationSchema,
      onSuccess,
      onError,
      processDataForSubmit: (data) => {
        // Handle secret masking for editing
        if (data.secret === MASKED_SECRET) {
          return { ...data, secret: MASKED_SECRET };
        }
        return data;
      },
    });

  const secretInputType = isEditingSecret || !appId ? "text" : "password";

  return (
    <div className="max-h-[80vh]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-4 w-full h-full"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  {t("form.url.label")}{" "}
                  <InfoTooltip>{t("form.url.tooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Input placeholder={t("form.url.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secret"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  {t("form.secret.label")}{" "}
                  <InfoTooltip>{t("form.secret.tooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type={secretInputType}
                      placeholder={t("form.secret.placeholder")}
                      disabled={
                        !isEditingSecret && field.value === MASKED_SECRET
                      }
                      {...field}
                      value={field.value === MASKED_SECRET ? "" : field.value}
                    />
                    {field.value === MASKED_SECRET && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingSecret(true)}
                      >
                        {t("form.secret.editButton")}
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventTypes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  {t("form.eventTypes.label")}{" "}
                  <InfoTooltip>{t("form.eventTypes.tooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {webhookEventTypes.map((eventType) => (
                      <div
                        key={eventType}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={eventType}
                          disabled={isLoading}
                          checked={field.value?.includes(eventType) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, eventType]);
                            } else {
                              field.onChange(
                                currentValues.filter((et) => et !== eventType),
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <FormLabel
                            htmlFor={eventType}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {t(`eventTypes.${eventType}.label`)}
                          </FormLabel>
                          <p className="text-xs text-gray-500">
                            {t(`eventTypes.${eventType}.description`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
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
                  <ConnectedAppNameAndLogo appName={webhooksApp.name} />
                ),
              })}
            </span>
          </Button>
        </form>
      </Form>
      {appStatus && (
        <ConnectedAppStatusMessage
          status={appStatus.status}
          statusText={appStatus.statusText}
        />
      )}
    </div>
  );
};

export default WebhooksAppSetup;
