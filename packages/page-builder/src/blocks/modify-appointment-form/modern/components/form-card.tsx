"use client";

import React, { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime, DateTime as LuxonDateTime } from "luxon";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  DateTimePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PhoneInput,
  SimpleTimePicker,
  ToggleGroup,
  ToggleGroupItem,
  use12HourFormat,
  usePrevious,
  useTimeZone,
} from "@timelish/ui";

import {
  I18nRichText,
  TranslationKeys,
  useI18n,
  useLocale,
} from "@timelish/i18n";
import { HourNumbers, MinuteNumbers } from "@timelish/types";
import { deepEqual, formatTime, parseTime } from "@timelish/utils";
import { Mail, Phone } from "lucide-react";
import { ModifyAppointmentFields } from "../../types";
import { useModifyAppointmentFormContext } from "./context";

const initialDate = DateTime.now().startOf("day").toJSDate();

const formSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.email(),
    date: z.date(),
    time: z.iso.time({ precision: -1 }),
  }),
  z.object({
    type: z.literal("phone"),
    phone: z.string().min(1),
    date: z.date(),
    time: z.iso.time({ precision: -1 }),
  }),
]);

export const FormCard: React.FC = () => {
  const t = useI18n("translation");
  const {
    fields: propsFields,
    setFields,
    setIsFormValid,
    searchError,
    setSearchError,
    type: modifyType,
    appointment,
  } = useModifyAppointmentFormContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: propsFields
      ? {
          ...propsFields,
          date: propsFields.dateTime,
          time: propsFields.dateTime
            ? formatTime({
                hour: propsFields.dateTime.getHours() as HourNumbers,
                minute: propsFields.dateTime.getMinutes() as MinuteNumbers,
              })
            : "09:00",
        }
      : {
          type: "email",
          email: "",
          date: initialDate,
          time: "09:00",
        },
  });

  const uses12HourFormat = use12HourFormat();
  const timeZone = useTimeZone();
  const locale = useLocale();

  const values = form.watch();
  const previousValues = usePrevious(values, values);
  React.useEffect(() => {
    if (!deepEqual(values, previousValues)) {
      const { date, time, ...rest } = values;
      const timeObj = parseTime(time);
      const dateTime = DateTime.fromJSDate(date)
        .set({ hour: timeObj.hour, minute: timeObj.minute })
        .setZone(timeZone)
        .toJSDate();
      setFields({ ...rest, dateTime } as ModifyAppointmentFields);
      setSearchError(undefined);
    }
  }, [values, setSearchError]);

  const isFormValid = form.formState.isValid;
  React.useEffect(() => {
    setIsFormValid(isFormValid);
  }, [isFormValid]);

  const time = useMemo(() => {
    const timeObj = parseTime(values.time ?? "09:00");
    return DateTime.fromObject({ hour: timeObj.hour, minute: timeObj.minute })
      .startOf("minute")
      .toJSDate();
  }, [values.time]);

  return (
    <div className="space-y-4 form-card card-container">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground form-card-title card-title">
          {t("modification.form.title")}
        </h2>
        <p className="text-xs text-muted-foreground form-card-description card-description">
          {t("modification.form.description")}
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={() => {}}
          className="flex flex-col gap-4 w-full form-card-form"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("modification.form.type.label")}</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    separated
                    size="md"
                    className="w-full"
                    variant="outline"
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      field.onBlur();
                    }}
                  >
                    <ToggleGroupItem value="email">
                      <Mail className="size-4" />
                      {t("modification.form.type.email")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="phone">
                      <Phone className="size-4" />{" "}
                      {t("modification.form.type.phone")}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {values.type === "email" && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modification.form.email.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("modification.form.email.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {values.type === "phone" && (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modification.form.phone.label")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      label={t("modification.form.phone.label")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modification.form.date.label")}</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      {...field}
                      hideTime
                      timeZone={timeZone}
                      commitOnChange
                      onChange={(date) => {
                        field.onChange(
                          date
                            ? LuxonDateTime.fromJSDate(date)
                                .set({ second: 0 })
                                .toJSDate()
                            : undefined,
                        );
                      }}
                      use12HourFormat={uses12HourFormat}
                      showSeconds={false}
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
                  <FormLabel>{t("modification.form.time.label")}</FormLabel>
                  <FormControl>
                    <SimpleTimePicker
                      {...field}
                      value={time}
                      onChange={(date) => {
                        field.onChange(
                          formatTime({
                            hour: date.getHours() as HourNumbers,
                            minute: date.getMinutes() as MinuteNumbers,
                          }),
                        );
                      }}
                      use12HourFormat={uses12HourFormat}
                      showSeconds={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {searchError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <I18nRichText
                namespace="translation"
                text={
                  searchError === "notFound"
                    ? "modification.form.searchError.notFound"
                    : `modification.form.searchError.notAllowed.${modifyType}`
                }
                args={{
                  name: appointment?.name ?? "",
                  service: appointment?.optionName ?? "",
                  dateTime: DateTime.fromJSDate(
                    appointment?.dateTime ?? new Date(),
                  ).toLocaleString(DateTime.DATETIME_HUGE, { locale }),
                  reason:
                    appointment &&
                    "reason" in appointment &&
                    t.has(
                      `modification.form.searchError.notAllowed.reason.${appointment?.reason}` as TranslationKeys,
                    )
                      ? t(
                          `modification.form.searchError.notAllowed.reason.${appointment?.reason}` as TranslationKeys,
                        )
                      : appointment && "reason" in appointment
                        ? appointment.reason
                        : t(
                            "modification.form.searchError.notAllowed.reason.unknown",
                          ),
                }}
              />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};
