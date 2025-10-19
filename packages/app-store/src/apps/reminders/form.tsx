"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import { DatabaseId } from "@vivid/types";
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
  SimpleTimePicker,
  toastPromise,
  use12HourFormat,
} from "@vivid/ui";
import {
  ArgumentsAutocomplete,
  SaveButton,
  TemplateSelector,
  useDemoArguments,
} from "@vivid/ui-admin";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkUniqueName, create, update } from "./actions";
import { reminderChannelLabels, reminderTypeLabels } from "./const";
import {
  getReminderSchemaWithUniqueCheck,
  ReminderUpdateModel,
} from "./models";
import {
  RemindersAdminKeys,
  RemindersAdminNamespace,
  remindersAdminNamespace,
} from "./translations/types";

export const ReminderForm: React.FC<{
  initialData?: ReminderUpdateModel & Partial<DatabaseId>;
  appId: string;
}> = ({ initialData, appId }) => {
  const t = useI18n<RemindersAdminNamespace, RemindersAdminKeys>(
    remindersAdminNamespace,
  );
  const tAdmin = useI18n("admin");
  const uses12HourFormat = use12HourFormat();

  const reminderTypeValues = Object.entries(reminderTypeLabels).map(
    ([value, label]) => ({ value, label: t(label) }) as IComboboxItem,
  );

  const reminderChannelValues = Object.entries(reminderChannelLabels).map(
    ([value, label]) => ({ value, label: t(label) }) as IComboboxItem,
  );

  const formSchema = getReminderSchemaWithUniqueCheck(
    (name) => checkUniqueName(appId, name, initialData?._id),
    t("form.name.validation.unique"),
  );

  type FormValues = z.infer<typeof formSchema>;

  const demoArguments = useDemoArguments();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialData || {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const fn = async () => {
        if (!initialData?._id) {
          const { _id } = await create(appId, data);
          router.push(
            `/admin/dashboard/communications/reminders/edit?id=${_id}`,
          );
        } else {
          await update(appId, initialData._id, data);

          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: tAdmin("common.toasts.saved"),
        error: tAdmin("common.toasts.error"),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const itemType = form.watch("type");
  // const changeType = (value: typeof itemType) => {
  //   const newValue = {
  //     ...form.getValues(),
  //     type: value,
  //   };

  //   const strippedValue = stripObject(newValue, reminderSchema) as Reminder;

  //   update(strippedValue);
  // };

  const itemChannel = form.watch("channel");
  // const changeChannel = (value: typeof itemChannel) => {
  //   const newValue = {
  //     ...form.getValues(),
  //     channel: value,
  //     templateId: undefined,
  //   };

  //   const strippedValue = stripObject(newValue as any as Reminder, reminderSchema) as Reminder;

  //   update(strippedValue);
  // };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.name.label")}</FormLabel>

                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t("form.name.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.type.label")}</FormLabel>
                <FormControl>
                  <Combobox
                    disabled={loading}
                    className="flex w-full font-normal text-base"
                    values={reminderTypeValues}
                    searchLabel={t("form.type.searchLabel")}
                    value={field.value}
                    onItemSelect={(value) => {
                      field.onChange(value);
                      field.onBlur();
                      // changeType(value as any);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {itemType === "timeBefore" && (
            <>
              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.weeks.label")}{" "}
                      <InfoTooltip>{t("form.weeks.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.days.label")}{" "}
                      <InfoTooltip>{t("form.days.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.hours.label")}{" "}
                      <InfoTooltip>{t("form.hours.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.minutes.label")}{" "}
                      <InfoTooltip>{t("form.minutes.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {itemType === "atTime" && (
            <>
              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.weeks.label")}{" "}
                      <InfoTooltip>{t("form.weeks.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                        onChange={(args) => {
                          field.onChange(args);
                          form.trigger("days");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.days.label")}{" "}
                      <InfoTooltip>{t("form.days.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.time.label")}{" "}
                      <InfoTooltip>{t("form.time.tooltip")}</InfoTooltip>
                    </FormLabel>

                    <FormControl>
                      <SimpleTimePicker
                        use12HourFormat={uses12HourFormat}
                        value={DateTime.fromObject({
                          hour: field.value?.hour,
                          minute: field.value?.minute,
                          second: 0,
                        }).toJSDate()}
                        onChange={(date) => {
                          const dateTime = date
                            ? DateTime.fromJSDate(date)
                            : undefined;
                          field.onChange({
                            hour: dateTime?.hour,
                            minute: dateTime?.minute,
                            second: dateTime?.second,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.channel.label")}{" "}
                  <InfoTooltip>{t("form.channel.tooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Combobox
                    disabled={loading}
                    className="flex w-full font-normal text-base"
                    values={reminderChannelValues}
                    searchLabel={t("form.channel.searchLabel")}
                    value={field.value}
                    onItemSelect={(value) => {
                      field.onChange(value);
                      field.onBlur();
                      // changeChannel(value as any);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {itemChannel === "email" && (
            <>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("form.subject.label")}
                      <InfoTooltip>
                        <p>{t("form.subject.tooltip")}</p>
                        <p>{t("form.subject.templatedValues")}</p>
                      </InfoTooltip>
                    </FormLabel>
                    <FormControl>
                      <ArgumentsAutocomplete
                        args={demoArguments}
                        asInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        disabled={loading}
                        placeholder={t("form.subject.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.template.label")}
                  <InfoTooltip>{t("form.template.tooltip")}</InfoTooltip>
                </FormLabel>
                <FormControl>
                  <TemplateSelector
                    type={itemChannel}
                    disabled={loading}
                    value={field.value}
                    onItemSelect={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SaveButton form={form} />
      </form>
    </Form>
  );
};
