"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@vivid/api-sdk";
import { AppsBlocksEditors } from "@vivid/app-store/blocks/editors";
import { AppsBlocksReaders } from "@vivid/app-store/blocks/readers";
import { useI18n } from "@vivid/i18n";
import { PageBuilder } from "@vivid/page-builder";
import {
  getPageFooterSchemaWithUniqueNameCheck,
  PageFooter,
} from "@vivid/types";
import {
  Breadcrumbs,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Heading,
  Input,
  toastPromise,
  useDebounceCacheFn,
} from "@vivid/ui";
import { SaveButton } from "@vivid/ui-admin";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  NavigationGuardDialog,
  useIsDirty,
} from "../../navigation-guard/dialog";

const baseNotAllowedBlocks = [
  "Booking",
  "Popup",
  "ModifyAppointmentForm",
  "BookingConfirmation",
  "Redirect",
];

export const PageFooterForm: React.FC<{
  initialData?: PageFooter;
  args: Record<string, any>;
  apps?: { appId: string; appName: string }[];
}> = ({ initialData, args, apps }) => {
  const t = useI18n("admin");

  const additionalBlocks = useMemo(() => {
    return apps?.reduce(
      (acc, app) => {
        acc.schemas = {
          ...acc.schemas,
          ...Object.fromEntries(
            Object.entries(AppsBlocksEditors[app.appName])
              .filter(([_, value]) => value.allowedInFooter)
              .map(([blockName, value]) => [
                `${blockName}-${app.appId}`,
                value.schema,
              ]),
          ),
        };
        acc.editors = {
          ...acc.editors,
          ...Object.fromEntries(
            Object.entries(AppsBlocksEditors[app.appName])
              .filter(([_, value]) => value.allowedInFooter)
              .map(([blockName, value]) => [
                `${blockName}-${app.appId}`,
                {
                  ...value.editor,
                  staticProps: {
                    ...value.editor.staticProps,
                    appId: app.appId,
                    appName: app.appName,
                  },
                },
              ]),
          ),
        };
        acc.readers = {
          ...acc.readers,
          ...Object.fromEntries(
            Object.entries(AppsBlocksReaders[app.appName]).map(
              ([blockName, value]) => [
                `${blockName}-${app.appId}`,
                {
                  ...value,
                  staticProps: {
                    ...value.staticProps,
                    appId: app.appId,
                    appName: app.appName,
                  },
                },
              ],
            ),
          ),
        };

        return acc;
      },
      { schemas: {}, editors: {}, readers: {} },
    );
  }, [apps]);

  const cachedUniqueNameCheck = useDebounceCacheFn(
    adminApi.pageFooters.checkUniquePageFooterName,
    300,
  );

  const formSchema = useMemo(
    () =>
      getPageFooterSchemaWithUniqueNameCheck(
        (name) => cachedUniqueNameCheck(name, initialData?._id),
        "pages.footers.name.unique",
      ),
    [cachedUniqueNameCheck, initialData?._id],
  );

  type PageFormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<PageFormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {},
  });

  const breadcrumbItems = React.useMemo(
    () => [
      { title: t("assets.dashboard"), link: "/dashboard" },
      { title: t("pages.title"), link: "/dashboard/pages" },
      {
        title: t("pages.footers.title"),
        link: "/dashboard/pages/footers",
      },
      {
        title: initialData?.name || t("pages.footers.new"),
        link: initialData?._id
          ? `/dashboard/pages/footers/${initialData._id}`
          : "/dashboard/pages/footers/new",
      },
    ],
    [initialData, t],
  );

  const { setError, trigger } = form;
  const onPageBuilderValidChange = React.useCallback(
    (isValid: boolean) =>
      isValid
        ? trigger()
        : setError("content", {
            message: t("templates.form.validation.templateNotValid"),
          }),
    [setError, trigger, t],
  );

  const { isFormDirty, onFormSubmit } = useIsDirty(form);
  const onSubmit = async (data: PageFormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData) {
          const { _id } = await adminApi.pageFooters.createPageFooter(data);

          onFormSubmit();

          setTimeout(() => {
            router.push(`/dashboard/pages/footers/${_id}`);
          }, 100);
        } else {
          await adminApi.pageFooters.updatePageFooter(initialData._id, data);
          onFormSubmit();

          setTimeout(() => {
            router.refresh();
          }, 100);
        }
      };

      await toastPromise(fn(), {
        success: t("pages.footers.toasts.changesSaved"),
        error: t("common.toasts.error"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <NavigationGuardDialog isDirty={isFormDirty} />
      <Breadcrumbs items={breadcrumbItems} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-8 relative"
      >
        <Heading
          title={t(initialData ? "pages.footers.edit" : "pages.footers.new")}
          description={t(
            initialData
              ? "pages.footers.managePageFooter"
              : "pages.footers.addNewPageFooter",
          )}
        />

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pages.footers.form.name")}</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    disabled={loading}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full flex-grow relative">
                <FormControl>
                  <PageBuilder
                    args={args}
                    notAllowedBlocks={baseNotAllowedBlocks}
                    value={field.value}
                    onIsValidChange={onPageBuilderValidChange}
                    onChange={field.onChange}
                    additionalBlocks={additionalBlocks}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SaveButton form={form} disabled={loading} ignoreDirty />
      </form>
    </Form>
  );
};
