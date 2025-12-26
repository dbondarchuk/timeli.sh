import { useI18n } from "@timelish/i18n";
import {
  BooleanSelect,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
} from "@timelish/ui";
import { AppSelector } from "@timelish/ui-admin";
import React from "react";
import { TabProps } from "./types";

export const VirtualTab: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");

  const isOnline = form.watch("isOnline");

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-medium">
        {t("services.options.form.onlineSettings.title")}
      </h3>
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <FormField
          control={form.control}
          name="isOnline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("services.options.form.onlineSettings.isOnline.label")}{" "}
                <InfoTooltip>
                  {t("services.options.form.onlineSettings.isOnline.tooltip")}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <BooleanSelect
                  value={field.value}
                  trueLabel={t(
                    "services.options.form.onlineSettings.isOnline.labels.true",
                  )}
                  falseLabel={t(
                    "services.options.form.onlineSettings.isOnline.labels.false",
                  )}
                  onValueChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isOnline && (
          <FormField
            control={form.control}
            name="meetingUrlProviderAppId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    "services.options.form.onlineSettings.meetingUrlProviderAppId.label",
                  )}{" "}
                  <InfoTooltip>
                    {t(
                      "services.options.form.onlineSettings.meetingUrlProviderAppId.tooltip",
                    )}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <AppSelector
                    scope="meeting-url-provider"
                    disabled={disabled}
                    value={field.value}
                    onItemSelect={(value) => field.onChange(value)}
                    allowClear
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
