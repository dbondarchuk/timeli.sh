"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime as LuxonDateTime } from "luxon";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Combobox,
  DateTimePicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  IComboboxItem,
  Input,
  PhoneInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  use12HourFormat,
  usePrevious,
} from "@timelish/ui";

import { useI18n } from "@timelish/i18n";
import { getTimeZones } from "@vvo/tzdb";
import { deepEqual } from "@timelish/utils";
import { ModifyAppointmentFields } from "../../types";
import { useModifyAppointmentFormContext } from "./context";


const timeZones: IComboboxItem[] = getTimeZones().map((zone) => ({
  label: `GMT${zone.currentTimeFormat}`,
  shortLabel: zone.alternativeName,
  value: zone.name,
}));

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
    timeZone,
    setTimeZone,
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
        <div>{i18n(`modification.form.${modifyType}Title`)}</div>
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{i18n("modification.form.typeLabel")}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={i18n("common.labels.formSelectOption")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        {i18n("common.labels.formEmail")}
                      </SelectItem>
                      <SelectItem value="phone">
                        {i18n("common.labels.formPhone")}
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
                  <FormLabel>{i18n("common.labels.formEmail")}</FormLabel>
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
                  <FormLabel>{i18n("common.labels.formPhone")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      label={i18n("common.labels.formPhone")}
                      {...field}
                    />
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
                <FormLabel>
                  {i18n("modification.form.dateTime.label")}
                </FormLabel>
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
          <p className="text-xs text-muted-foreground">
            {i18n.rich("common.formats.selectTimezoneLabel", {
              timeZoneCombobox: () => (
                <Combobox
                  values={timeZones}
                  className="mx-1"
                  searchLabel={i18n("common.labels.searchTimezone")}
                  customSearch={(search) =>
                    timeZones.filter((zone) =>
                      (zone.label as string)
                        .toLocaleLowerCase()
                        .includes(search.toLocaleLowerCase()),
                    )
                  }
                  value={timeZone}
                  onItemSelect={(value) => setTimeZone(value)}
                />
              ),
            })}
          </p>
        </div>
      </form>
    </Form>
  );
};
