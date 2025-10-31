"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime as LuxonDateTime } from "luxon";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  use12HourFormat,
  usePrevious,
  useTimeZone,
} from "@vivid/ui";

import { useI18n } from "@vivid/i18n";
import { deepEqual } from "@vivid/utils";
import { useModifyAppointmentFormContext } from "./context";
import { ModifyAppointmentFields } from "./types";

const formSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.email(),
    dateTime: z.date(),
  }),
  z.object({
    type: z.literal("phone"),
    phone: z.string().min(1),
    dateTime: z.date(),
  }),
]);

export const FormCard: React.FC = () => {
  const i18n = useI18n("translation");
  const {
    fields: propsFields,
    setFields,
    setIsFormValid,
    type: modifyType,
  } = useModifyAppointmentFormContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: propsFields || {
      type: "email",
      email: "",
      dateTime: new Date(),
    },
  });

  const uses12HourFormat = use12HourFormat();
  const timeZone = useTimeZone();

  const values = form.watch();
  const previousValues = usePrevious(values, values);
  React.useEffect(() => {
    if (!deepEqual(values, previousValues)) {
      setFields(values as ModifyAppointmentFields);
    }
  }, [values]);

  const isFormValid = form.formState.isValid;
  React.useEffect(() => {
    setIsFormValid(isFormValid);
  }, [isFormValid]);

  return (
    <Form {...form}>
      <form onSubmit={() => {}} className="space-y-4">
        <div>{i18n(`${modifyType}_appointment_form_title`)}</div>
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {i18n("modify_appointment_form_type_label")}
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={i18n("form_select_option")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        {i18n("form_email_label")}
                      </SelectItem>
                      <SelectItem value="phone">
                        {i18n("form_phone_label")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>{i18n("form_email_label")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{i18n("form_phone_label")}</FormLabel>
                  <FormControl>
                    <PhoneInput label={i18n("form_phone_label")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date & Time</FormLabel>
                <FormControl>
                  <DateTimePicker
                    {...field}
                    timeZone={timeZone}
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
        </div>
      </form>
    </Form>
  );
};
