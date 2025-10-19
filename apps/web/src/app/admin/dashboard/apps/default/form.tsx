"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import {
  DefaultAppsConfiguration,
  defaultAppsConfigurationSchema,
} from "@vivid/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  toastPromise,
} from "@vivid/ui";
import { AppSelector, SaveButton } from "@vivid/ui-admin";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { updateDefaultAppsConfiguration } from "./actions";
import { MigrateAssetsDialog } from "./migrate-assets-dialog";

export const DefaultAppsConfigurationForm: React.FC<{
  values: DefaultAppsConfiguration;
}> = ({ values }) => {
  const t = useI18n("admin");
  const form = useForm<DefaultAppsConfiguration>({
    resolver: zodResolver(defaultAppsConfigurationSchema),
    mode: "all",
    values,
  });

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: DefaultAppsConfiguration) => {
    try {
      setLoading(true);
      await toastPromise(updateDefaultAppsConfiguration(data), {
        success: t("apps.defaultAppsForm.toasts.changesSaved"),
        error: t("apps.defaultAppsForm.toasts.requestError"),
      });

      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 relative"
      >
        <div className="gap-2 flex flex-col md:grid md:grid-cols-2 md:gap-4">
          <FormField
            control={form.control}
            name="email.appId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("apps.defaultAppsForm.emailSender")}</FormLabel>
                <FormControl>
                  <AppSelector
                    onItemSelect={field.onChange}
                    scope="mail-send"
                    value={field.value}
                    disabled={loading}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textMessage.appId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("apps.defaultAppsForm.textMessageSender")}
                </FormLabel>
                <FormControl>
                  <AppSelector
                    onItemSelect={field.onChange}
                    scope="text-message-send"
                    value={field.value}
                    disabled={loading}
                    className="w-full"
                    allowClear
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="assetsStorage.appId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("apps.defaultAppsForm.assetsStorage")}</FormLabel>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                <FormControl>
                  <AppSelector
                    onItemSelect={field.onChange}
                    scope="assets-storage"
                    value={field.value}
                    disabled={loading}
                    className="flex-1"
                  />
                </FormControl>
                <MigrateAssetsDialog disabled={loading} appId={field.value} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};
