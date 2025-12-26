"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi } from "@timelish/api-sdk";
import { useI18n } from "@timelish/i18n";
import {
  AppointmentOptionUpdateModel,
  DatabaseId,
  getAppointmentOptionSchemaWithUniqueCheck,
} from "@timelish/types";
import {
  cn,
  Form,
  ResponsiveTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
  toastPromise,
  useDebounceCacheFn,
} from "@timelish/ui";
import { SaveButton } from "@timelish/ui-admin";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AddonsTab } from "./tabs/addons";
import { CancellationsTab } from "./tabs/cancellations";
import { DuplicatesTab } from "./tabs/duplicates";
import { FieldsTab } from "./tabs/fields";
import { GeneralTab } from "./tabs/general";
import { PaymentsTab } from "./tabs/payments";
import { ReschedulesTab } from "./tabs/reschedules";

export const OptionForm: React.FC<{
  initialData?: AppointmentOptionUpdateModel & Partial<DatabaseId>;
}> = ({ initialData }) => {
  const t = useI18n("admin");

  const cachedUniqueNameCheck = useDebounceCacheFn(
    adminApi.serviceOptions.checkServiceOptionUniqueName,
    300,
  );

  const formSchema = getAppointmentOptionSchemaWithUniqueCheck(
    (name) => cachedUniqueNameCheck(name, initialData?._id),
    "services.options.nameUnique",
  );

  type FormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {
      requireDeposit: "inherit",
      isOnline: false,
      isAutoConfirm: "inherit",
      duplicateAppointmentCheck: {
        enabled: false,
      },
    },
  });

  const triggerValidation = useCallback(() => {
    form.trigger();
  }, [form]);

  React.useEffect(() => triggerValidation(), [triggerValidation]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData?._id) {
          const { _id } =
            await adminApi.serviceOptions.createServiceOption(data);
          router.push(`/dashboard/services/options/${_id}`);
        } else {
          await adminApi.serviceOptions.updateServiceOption(
            initialData._id,
            data,
          );

          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: t("services.options.form.toasts.changesSaved"),
        error: t("services.options.form.toasts.requestError"),
      });
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
        className="w-full space-y-8 relative flex flex-col gap-2 pb-4"
      >
        <Tabs
          onValueChange={triggerValidation}
          defaultValue={"general"}
          className="space-y-4"
          orientation="vertical"
        >
          <ResponsiveTabsList className="w-full flex-wrap h-auto">
            <TabsTrigger
              value="general"
              className={cn(
                form.getFieldState("name").invalid ||
                  form.getFieldState("description").invalid ||
                  form.getFieldState("duration").invalid ||
                  form.getFieldState("price").invalid ||
                  form.getFieldState("isAutoConfirm").invalid ||
                  form.getFieldState("isOnline").invalid ||
                  form.getFieldState("meetingUrlProviderAppId").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("services.options.form.tabs.general")}
            </TabsTrigger>
            <TabsTrigger
              value="fields"
              className={cn(
                form.getFieldState("fields").invalid ? "text-destructive" : "",
              )}
            >
              {t("services.options.form.tabs.fields")}
            </TabsTrigger>
            <TabsTrigger
              value="addons"
              className={cn(
                form.getFieldState("addons").invalid ? "text-destructive" : "",
              )}
            >
              {t("services.options.form.tabs.addons")}
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className={cn(
                form.getFieldState("requireDeposit").invalid ||
                  form.getFieldState("depositPercentage").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("services.options.form.tabs.payments")}
            </TabsTrigger>
            <TabsTrigger
              value="duplicates"
              className={cn(
                form.getFieldState("duplicateAppointmentCheck").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("services.options.form.tabs.duplicates")}
            </TabsTrigger>
            <TabsTrigger
              value="cancellations"
              className={cn(
                form.getFieldState("cancellationPolicy").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("services.options.form.cancellationPolicy.title")}
            </TabsTrigger>
            <TabsTrigger
              value="reschedules"
              className={cn(
                form.getFieldState("reschedulePolicy").invalid
                  ? "text-destructive"
                  : "",
              )}
            >
              {t("services.options.form.reschedulePolicy.title")}
            </TabsTrigger>
          </ResponsiveTabsList>
          <TabsContent value="general">
            <GeneralTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="duplicates">
            <DuplicatesTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="fields">
            <FieldsTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="addons">
            <AddonsTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="cancellations">
            <CancellationsTab form={form} disabled={loading} />
          </TabsContent>
          <TabsContent value="reschedules">
            <ReschedulesTab form={form} disabled={loading} />
          </TabsContent>
        </Tabs>
        <SaveButton form={form} disabled={loading} />
      </form>
    </Form>
  );
};
