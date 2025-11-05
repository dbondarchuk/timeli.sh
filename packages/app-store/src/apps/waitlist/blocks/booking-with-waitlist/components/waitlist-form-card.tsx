"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppointmentFields } from "@timelish/types";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  EmailField,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  NameField,
  PhoneField,
  ToggleGroup,
  ToggleGroupItem,
  usePrevious,
} from "@timelish/ui";

import {
  waitlistRequestDates,
  waitlistRequestFormSchemaBase,
} from "../../../models/waitlist";

import { useI18n } from "@timelish/i18n";
import { deepEqual } from "@timelish/utils";
import { DateTime as LuxonDateTime } from "luxon";
import {
  WaitlistPublicAllKeys,
  WaitlistPublicKeys,
  waitlistPublicNamespace,
  WaitlistPublicNamespace,
} from "../../../translations/types";
import { useScheduleContext } from "./context";
import { WaitlistDatePicker } from "./waitlist-date-picker";

const formSchema = waitlistRequestFormSchemaBase.and(
  z
    .object({
      asSoonAsPossible: z.literal(false, {
        error:
          "app_waitlist_public.block.asSoonAsPossible.required" satisfies WaitlistPublicAllKeys,
      }),
      dates: waitlistRequestDates,
    })
    .or(
      z.object({
        asSoonAsPossible: z.literal(true, {
          error:
            "app_waitlist_public.block.asSoonAsPossible.required" satisfies WaitlistPublicAllKeys,
        }),
        dates: z.any().optional(),
      }),
    ),
);

export const WaitlistFormCard: React.FC = () => {
  const t = useI18n<WaitlistPublicNamespace, WaitlistPublicKeys>(
    waitlistPublicNamespace,
  );

  const minDate = useMemo(
    () => LuxonDateTime.now().startOf("day").toJSDate(),
    [],
  );

  const {
    fields: propsFields,
    setFields,
    setIsFormValid,
    setWaitlistTimes,
    waitlistTimes,
  } = useScheduleContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      ...(propsFields || {
        email: "",
        name: "",
        phone: "",
      }),
      asSoonAsPossible: waitlistTimes.asSoonAsPossible ?? true,
      dates: waitlistTimes.dates || [],
    } as z.infer<typeof formSchema>,
  });

  const values = form.watch();
  const previousValues = usePrevious(values, values);
  React.useEffect(() => {
    if (!deepEqual(values, previousValues)) {
      const { asSoonAsPossible, dates, ...rest } = values;

      setFields(rest as AppointmentFields);
      setWaitlistTimes({ asSoonAsPossible, dates });
    }
  }, [values]);

  const isFormValid = form.formState.isValid;
  React.useEffect(() => {
    setIsFormValid(isFormValid);
  }, [isFormValid]);

  return (
    <Form {...form}>
      <form onSubmit={() => {}} className="space-y-8">
        <h4 className="text-2xl text-center">{t("block.title")}</h4>
        <div className="flex flex-col gap-2">
          <NameField
            control={form.control}
            name="name"
            required={true}
            data={{ label: "form_name_label" }}
            disabled={false}
            namespace={undefined}
          />
          <EmailField
            control={form.control}
            name="email"
            required={true}
            data={{ label: "form_email_label" }}
            disabled={false}
            namespace={undefined}
          />
          <PhoneField
            control={form.control}
            name="phone"
            required={true}
            data={{ label: "form_phone_label" }}
            disabled={false}
            namespace={undefined}
          />
          <FormField
            control={form.control}
            name="asSoonAsPossible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("block.when.label")}</FormLabel>
                <ToggleGroup
                  type="single"
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => {
                    field.onChange(value === "true");
                    field.onBlur();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <ToggleGroupItem value="true" className="max-sm:text-xs">
                    {t("block.asSoonAsPossible.label")}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="false" className="max-sm:text-xs">
                    {t(
                      values.asSoonAsPossible
                        ? "block.dates.label"
                        : "block.dates.label_count",
                      {
                        count: values.dates?.length || 0,
                      },
                    )}
                  </ToggleGroupItem>
                </ToggleGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          {!values.asSoonAsPossible && (
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem>
                  <WaitlistDatePicker
                    value={field.value || []}
                    onChange={(val) => {
                      field.onChange(val);
                      field.onBlur();
                    }}
                    minDate={minDate}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </form>
    </Form>
  );
};
