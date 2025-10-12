"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@vivid/i18n";
import { communicationChannels, DatabaseId } from "@vivid/types";
import {
  ArgumentsAutocomplete,
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
  SaveButton,
  SimpleTimePicker,
  TemplateSelector,
  toastPromise,
  use12HourFormat,
  useDemoArguments,
} from "@vivid/ui";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  checkUniqueFollowUpName,
  createFollowUp,
  updateFollowUp,
} from "./actions";
import {
  followUpTypes,
  FollowUpUpdateModel,
  getFollowUpSchemaWithUniqueCheck,
} from "./models";
import {
  FollowUpsAdminKeys,
  FollowUpsAdminNamespace,
  followUpsAdminNamespace,
} from "./translations/types";

export const FollowUpForm: React.FC<{
  initialData?: FollowUpUpdateModel & Partial<DatabaseId>;
  appId: string;
}> = ({ initialData, appId }) => {
  const t = useI18n<FollowUpsAdminNamespace, FollowUpsAdminKeys>(
    followUpsAdminNamespace,
  );
  const uses12HourFormat = use12HourFormat();

  const followUpTypeValues = followUpTypes.map(
    (value) => ({ value, label: t(`triggers.${value}`) }) as IComboboxItem,
  );

  const followUpChannelValues = communicationChannels.map(
    (value) => ({ value, label: t(`channels.${value}`) }) as IComboboxItem,
  );

  const formSchema = getFollowUpSchemaWithUniqueCheck(
    (name) => checkUniqueFollowUpName(appId, name, initialData?._id),
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
          const { _id } = await createFollowUp(appId, data);
          router.push(
            `/admin/dashboard/communications/follow-ups/edit?id=${_id}`,
          );
        } else {
          await updateFollowUp(appId, initialData._id, data);

          router.refresh();
        }
      };

      await toastPromise(fn(), {
        success: t(
          initialData?._id
            ? "statusText.follow_up_updated"
            : "statusText.follow_up_created",
        ),
        error: t(
          initialData?._id
            ? "statusText.error_updating_follow_up"
            : "statusText.error_creating_follow_up",
        ),
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const itemType = form.watch("type");
  const itemChannel = form.watch("channel");

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
            name="afterAppointmentCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.afterAppointmentCount.label")}{" "}
                  <InfoTooltip>
                    {t("form.afterAppointmentCount.tooltip")}
                  </InfoTooltip>
                </FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    disabled={loading}
                    placeholder={t("form.afterAppointmentCount.placeholder")}
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
                    values={followUpTypeValues}
                    searchLabel={t("form.type.searchLabel")}
                    value={field.value}
                    onItemSelect={(value) => {
                      field.onChange(value);
                      field.onBlur();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {itemType === "timeAfter" && (
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
                    values={followUpChannelValues}
                    searchLabel={t("form.channel.searchLabel")}
                    value={field.value}
                    onItemSelect={(value) => {
                      field.onChange(value);
                      field.onBlur();
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
