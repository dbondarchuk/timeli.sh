"use client";

import { useI18n } from "@timelish/i18n";
import {
  BooleanSelect,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@timelish/ui";
import {
  ConnectedAppStatusMessage,
  SaveButton,
  TemplateSelector,
} from "@timelish/ui-admin";
import { useConnectedAppSetup } from "../../hooks/use-connected-app-setup";
import { MyCabinetApp } from "./app";
import { MyCabinetConfiguration, myCabinetConfigurationSchema } from "./models";
import {
  MyCabinetAdminKeys,
  MyCabinetAdminNamespace,
  myCabinetAdminNamespace,
} from "./translations/types";

export const MyCabinetAppSetup: React.FC<{ appId?: string }> = ({ appId }) => {
  if (!appId) return null;
  const t = useI18n<MyCabinetAdminNamespace, MyCabinetAdminKeys>(
    myCabinetAdminNamespace,
  );
  const { appStatus, form, isLoading, onSubmit } =
    useConnectedAppSetup<MyCabinetConfiguration>({
      appId,
      appName: MyCabinetApp.name,
      schema: myCabinetConfigurationSchema,
    });

  const allowPhone = form.watch("allowPhoneLogin");

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otpEmailTemplateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.otpEmailTemplateId.label")}</FormLabel>
                <FormControl>
                  <TemplateSelector
                    type="email"
                    disabled={isLoading}
                    value={field.value}
                    onItemSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowPhoneLogin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.allowPhoneLogin.label")}</FormLabel>
                <FormControl>
                  <BooleanSelect
                    value={!!field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {allowPhone && (
            <FormField
              control={form.control}
              name="otpTextTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.otpTextTemplateId.label")}</FormLabel>
                  <FormControl>
                    <TemplateSelector
                      type="text-message"
                      disabled={isLoading}
                      value={field.value}
                      onItemSelect={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <SaveButton form={form} disabled={isLoading} isLoading={isLoading} />
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
