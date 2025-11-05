"use client";
import {
  ApplyDiscountRequest,
  AppointmentFields,
  getFields,
} from "@timelish/types";

import React, { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Button,
  Form,
  FormItem,
  Input,
  Label,
  Spinner,
  cn,
  usePrevious,
} from "@timelish/ui";

import { clientApi } from "@timelish/api-sdk";
import { TranslationKeys, useI18n } from "@timelish/i18n";
import { fieldSchemaMapper, fieldsComponentMap } from "@timelish/ui";
import { deepEqual, formatAmountString } from "@timelish/utils";
import { DateTime as Luxon } from "luxon";
import { CardWithAppointmentInformation } from "./card-with-info";
import { useScheduleContext } from "./context";

export const FormCard: React.FC = () => {
  const i18n = useI18n("translation");
  const {
    appointmentOption,
    selectedAddons,
    dateTime,
    fields: propsFields,
    setFields,
    formFields,
    discount,
    showPromoCode,
    setDiscount,
    discountAmount,
    setIsFormValid,
  } = useScheduleContext();

  if (!dateTime) return null;

  const [promoCode, setPromoCode] = React.useState(discount?.code ?? "");
  const [promoCodeError, setPromoCodeError] = React.useState<TranslationKeys>();
  const [isLoading, setIsLoading] = React.useState(false);

  const fields = getFields(formFields);

  const formSchema = useMemo(
    () =>
      z.object(
        fields.reduce(
          (prev, field) => {
            prev[field.name] = fieldSchemaMapper(field);
            return prev;
          },
          {} as { [field: string]: z.ZodType<any, any> },
        ),
      ),
    [fields],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: propsFields,
  });

  const values = form.watch();
  const previousValues = usePrevious(values, values);
  React.useEffect(() => {
    if (!deepEqual(values, previousValues)) {
      setFields(values as AppointmentFields);
    }
  }, [values]);

  const isFormValid = form.formState.isValid;
  React.useEffect(() => {
    setIsFormValid(isFormValid);
  }, [isFormValid]);

  const applyPromoCode = async () => {
    if (!promoCode || !dateTime) {
      setPromoCodeError(undefined);
      return;
    }

    setIsLoading(true);

    try {
      const request = {
        code: promoCode,
        optionId: appointmentOption._id,
        addons: selectedAddons?.map((addon) => addon._id),
        dateTime: Luxon.fromObject(
          {
            year: dateTime.date.getFullYear(),
            month: dateTime.date.getMonth() + 1,
            day: dateTime.date.getDate(),
            hour: dateTime.time.hour,
            minute: dateTime.time.minute,
            second: 0,
          },
          { zone: dateTime.timeZone },
        )
          .toUTC()
          .toJSDate(),
        name: form.getValues("name") || "",
        email: form.getValues("email") || "",
        phone: form.getValues("phone") || "",
      } satisfies ApplyDiscountRequest;

      const data = await clientApi.discounts.applyDiscount(request);

      setDiscount(data);
      setPromoCodeError(undefined);
    } catch (e) {
      console.error(e);

      setPromoCodeError("promo_code_error");

      setDiscount(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={() => {}} className="space-y-8">
        <CardWithAppointmentInformation title="form_title_label">
          <div className="flex flex-col gap-2">
            {fields.map((field) => (
              <React.Fragment key={field.name}>
                {fieldsComponentMap()[field.type](field, form.control)}
              </React.Fragment>
            ))}

            {showPromoCode && (
              <FormItem>
                <Label htmlFor="promo-code">{i18n("form_promo_code")}</Label>
                <div className="flex flex-row gap-2">
                  <Input
                    className="w-full flex-1"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoCodeError(undefined);

                      setDiscount(undefined);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => applyPromoCode()}
                    disabled={!promoCode}
                  >
                    {isLoading && <Spinner />} {i18n("apply")}
                  </Button>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    promoCodeError ? "text-destructive" : "text-green-700",
                  )}
                >
                  {!!promoCodeError && i18n(promoCodeError)}
                  {discount &&
                    i18n("promo_code_success", {
                      code: discount.code,
                      discount: formatAmountString(discountAmount),
                    })}
                </p>
              </FormItem>
            )}
          </div>
        </CardWithAppointmentInformation>
      </form>
    </Form>
  );
};
