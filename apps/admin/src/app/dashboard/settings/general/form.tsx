"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { languages, useI18n } from "@vivid/i18n";
import {
  GeneralConfiguration,
  generalConfigurationSchema,
  zNonEmptyString,
} from "@vivid/types";
import {
  Combobox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  IComboboxItem,
  InfoTooltip,
  Input,
  PhoneInput,
  TagInput,
  Textarea,
  toastPromise,
} from "@vivid/ui";
import { AssetSelectorInput, SaveButton } from "@vivid/ui-admin";
import { getTimeZones } from "@vvo/tzdb";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

import { LanguageOptions } from "@/constants/texts";
import { adminApi } from "@vivid/api-sdk";

const timeZones = getTimeZones();
const timeZoneValues: IComboboxItem[] = timeZones.map((zone) => ({
  label: `GMT${zone.currentTimeFormat}`,
  shortLabel: `${zone.alternativeName}`,
  value: zone.name,
}));

export const GeneralSettingsForm: React.FC<{
  values: GeneralConfiguration;
}> = ({ values }) => {
  const t = useI18n("admin");
  const form = useForm<GeneralConfiguration>({
    resolver: zodResolver(generalConfigurationSchema),
    mode: "all",
    values,
  });

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: GeneralConfiguration) => {
    try {
      setLoading(true);
      await toastPromise(
        adminApi.configuration.setConfiguration("general", {
          ...data,
        }),
        {
          success: t("settings.general.form.toasts.changesSaved"),
          error: t("settings.general.form.toasts.requestError"),
        },
      );

      if (data.language !== values.language && window?.location) {
        // Hard reload to apply new language and delay to show toast
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTags = (value: string) => {
    let tags = value.split(/,\s?/g);
    if (tags.length === 1 && !tags[0]) tags = [];

    return tags;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 relative pb-4"
      >
        <div className="gap-2 flex flex-col md:grid md:grid-cols-2 md:gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.name")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("settings.general.form.namePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.title")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("settings.general.form.titlePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    autoResize
                    disabled={loading}
                    placeholder={t(
                      "settings.general.form.descriptionPlaceholder",
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.general.form.keywords")}{" "}
                  <InfoTooltip>
                    {t("settings.general.form.keywordsTooltip")}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <TagInput
                    {...field}
                    value={getTags(field.value)}
                    onChange={(value) =>
                      form.setValue("keywords", value.join(", "))
                    }
                    tagValidator={zNonEmptyString(
                      t("settings.general.form.keywordValidation"),
                      2,
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.phone")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    disabled={loading}
                    label={t("settings.general.form.phone")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.email")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="email"
                    placeholder={t("settings.general.form.emailPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.domain")}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("settings.general.form.domainPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.general.form.address")}{" "}
                  <InfoTooltip>
                    {t("settings.general.form.addressTooltip")}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("settings.general.form.addressPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.general.form.logo")}{" "}
                  <InfoTooltip>
                    {t("settings.general.form.logoTooltip")}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <AssetSelectorInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={loading}
                    placeholder={t("settings.general.form.logoPlaceholder")}
                    accept="image/*"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="favicon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.general.form.favicon")}{" "}
                  <InfoTooltip>
                    {t("settings.general.form.faviconTooltip")}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <AssetSelectorInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={loading}
                    placeholder={t("settings.general.form.faviconPlaceholder")}
                    accept="image/*"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.language")}</FormLabel>
                <FormControl>
                  <Combobox
                    values={languages.map((language) => ({
                      label: LanguageOptions[language],
                      value: language,
                    }))}
                    className="w-full"
                    value={field.value}
                    onItemSelect={(val) => {
                      field.onChange(val);
                      field.onBlur();
                    }}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeZone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.general.form.timeZone")}</FormLabel>
                <FormControl>
                  <Combobox
                    className="flex w-full font-normal text-base"
                    values={timeZoneValues}
                    searchLabel={t("settings.general.form.selectTimeZone")}
                    disabled={loading}
                    customSearch={(search) =>
                      timeZoneValues.filter(
                        (zone) =>
                          (zone.label as string)
                            .toLocaleLowerCase()
                            .indexOf(search.toLocaleLowerCase()) >= 0,
                      )
                    }
                    value={field.value}
                    onItemSelect={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};
