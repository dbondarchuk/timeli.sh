"use client";

import { useI18n } from "@vivid/i18n";
import { AppSetupProps } from "@vivid/types";
import {
  ArgumentsAutocomplete,
  BooleanSelect,
  Button,
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
  TemplateSelector,
  useDemoArguments,
} from "@vivid/ui";
import React from "react";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { WaitlistApp } from "./app";
import { WaitlistConfiguration, waitlistConfigurationSchema } from "./models";
import {
  WaitlistAdminKeys,
  WaitlistAdminNamespace,
  waitlistAdminNamespace,
} from "./translations/types";

export const WaitlistAppSetup: React.FC<AppSetupProps> = ({
  onSuccess,
  onError,
  appId: existingAppId,
}) => {
  const { appStatus, form, isLoading, isValid, onSubmit } =
    useConnectedAppSetup<WaitlistConfiguration>({
      appId: existingAppId,
      appName: WaitlistApp.name,
      schema: waitlistConfigurationSchema,
      onSuccess,
      onError,
      initialData: {
        notifyOnNewEntry: true,
        notifyCustomerOnNewEntry: false,
      },
      processDataForSubmit: (data) => ({
        type: "set-configuration",
        configuration: data,
      }),
    });

  const demoArguments = useDemoArguments({
    waitlistEntry: true,
    noAppointment: true,
  });

  const t = useI18n<WaitlistAdminNamespace, WaitlistAdminKeys>(
    waitlistAdminNamespace,
  );
  const enableCustomerNotification = form.watch("notifyCustomerOnNewEntry");
  const enableNewEntryNotification = form.watch("notifyOnNewEntry");

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <FormField
              control={form.control}
              name="dontDismissWaitlistOnAppointmentCreate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t(
                      "setup.form.dontDismissWaitlistOnAppointmentCreate.label",
                    )}
                    <InfoTooltip>
                      {t(
                        "setup.form.dontDismissWaitlistOnAppointmentCreate.tooltip",
                      )}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <BooleanSelect
                      disabled={isLoading}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notifyOnNewEntry"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("setup.form.notifyOnNewEntry.label")}
                    <InfoTooltip>
                      {t("setup.form.notifyOnNewEntry.tooltip")}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <BooleanSelect
                      disabled={isLoading}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {enableNewEntryNotification && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      {t("setup.form.email.label")}
                      <InfoTooltip>{t("setup.form.email.tooltip")}</InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="email"
                        placeholder={t("setup.form.email.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="notifyCustomerOnNewEntry"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    {t("setup.form.notifyCustomerOnNewEntry.label")}
                    <InfoTooltip>
                      {t("setup.form.notifyCustomerOnNewEntry.tooltip")}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <BooleanSelect
                      disabled={isLoading}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        field.onBlur();

                        form.trigger("customerNewEntrySubject");
                        form.trigger("customerNewEntryTemplateId");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {enableCustomerNotification && (
              <>
                <FormField
                  control={form.control}
                  name="customerNewEntrySubject"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        {t("setup.form.customerNewEntrySubject.label")}
                        <InfoTooltip>
                          {t("setup.form.customerNewEntrySubject.tooltip")}
                        </InfoTooltip>
                      </FormLabel>
                      <FormControl>
                        <ArgumentsAutocomplete
                          asInput
                          args={demoArguments}
                          disabled={isLoading}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            field.onBlur();
                            form.trigger("notifyCustomerOnNewEntry");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerNewEntryTemplateId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        {t("setup.form.customerNewEntryTemplateId.label")}
                        <InfoTooltip>
                          {t("setup.form.customerNewEntryTemplateId.tooltip")}
                        </InfoTooltip>
                      </FormLabel>
                      <FormControl>
                        <TemplateSelector
                          type="email"
                          disabled={isLoading}
                          value={field.value}
                          onItemSelect={(value) => {
                            field.onChange(value);
                            field.onBlur();
                            form.trigger("notifyCustomerOnNewEntry");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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
                      appName={WaitlistApp.name}
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
