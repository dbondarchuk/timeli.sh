"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import {
  SocialConfiguration,
  socialConfigurationSchema,
  SocialLink,
} from "@vivid/types";
import { Form, toastPromise } from "@vivid/ui";
import { SaveButton, Sortable } from "@vivid/ui-admin";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { SocialLinkCard } from "./socialLinkCard";

export const SocialSettingsForm: React.FC<{
  values: SocialConfiguration;
}> = ({ values }) => {
  const t = useI18n("admin");
  const form = useForm<SocialConfiguration>({
    resolver: zodResolver(socialConfigurationSchema),
    mode: "all",
    values,
  });

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit = async (data: SocialConfiguration) => {
    try {
      setLoading(true);
      await toastPromise(
        adminApi.configuration.setConfiguration("social", data),
        {
          success: t("settings.social.form.toasts.changesSaved"),
          error: t("settings.social.form.toasts.requestError"),
        },
      );
      router.refresh();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const {
    fields: links,
    append: appendLink,
    remove: removeLink,
    swap: swapLinks,
  } = useFieldArray({
    control: form.control,
    name: "links",
    keyName: "fields_id",
  });

  const linksIds = React.useMemo(() => links.map((c) => c.fields_id), [links]);

  const addNewLink = () => {
    appendLink({
      url: "",
    } as Partial<SocialLink> as SocialLink);
  };

  const sort = (activeId: string, overId: string) => {
    const activeIndex = links.findIndex((x) => x.fields_id === activeId);
    const overIndex = links.findIndex((x) => x.fields_id === overId);

    if (activeIndex < 0 || overIndex < 0) return;

    swapLinks(activeIndex, overIndex);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 relative"
      >
        <Sortable
          title={t("settings.social.form.socialLinks")}
          ids={linksIds}
          onAdd={addNewLink}
          onSort={sort}
        >
          <div className="flex flex-grow flex-col gap-4">
            {links.map((link, index) => (
              <SocialLinkCard
                form={form}
                item={link}
                key={link.fields_id}
                name={`links.${index}`}
                disabled={loading}
                remove={() => removeLink(index)}
              />
            ))}
          </div>
        </Sortable>
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};
