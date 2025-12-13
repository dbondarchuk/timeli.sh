import { zodResolver } from "@hookform/resolvers/zod";
import { clientApi } from "@timelish/api-sdk";
import { TranslationKeys, useI18n } from "@timelish/i18n";
import {
  ApplyDiscountRequest,
  AppointmentFields,
  getFields,
} from "@timelish/types";
import {
  Button,
  cn,
  fieldSchemaMapper,
  fieldsComponentMap,
  Form,
  FormItem,
  Input,
  Label,
  Spinner,
  usePrevious,
} from "@timelish/ui";
import { deepEqual, formatAmountString } from "@timelish/utils";
import { DateTime } from "luxon";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useScheduleContext } from "./context";

export const FormCard: React.FC = () => {
  const i18n = useI18n("translation");

  const {
    selectedAppointmentOption,
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

  if (!dateTime || !selectedAppointmentOption) return null;

  const [promoCode, setPromoCode] = useState(discount?.code ?? "");
  const [promoCodeError, setPromoCodeError] = useState<TranslationKeys>();
  const [isLoading, setIsLoading] = useState(false);

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
  useEffect(() => {
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
        optionId: selectedAppointmentOption._id,
        addons: selectedAddons?.map((addon) => addon._id),
        dateTime: DateTime.fromObject(
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
    <div className="space-y-6 form-card card-container">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground form-card-title card-title">
          {i18n("booking.form.title")}
        </h2>
        <p className="text-xs text-muted-foreground form-card-description card-description">
          {i18n("booking.form.description")}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={() => {}}
          className="space-y-2 form-card-form form-card-form-fields"
        >
          <div className="flex flex-col gap-2 form-card-form-fields">
            {fields.map((field) => (
              <React.Fragment key={field.name}>
                {fieldsComponentMap()[field.type](field, form.control)}
              </React.Fragment>
            ))}

            {showPromoCode && (
              <FormItem>
                <Label htmlFor="promo-code">{i18n("form_promo_code")}</Label>
                <div className="flex flex-row gap-2 form-card-promo-code-container">
                  <Input
                    className="w-full flex-1 form-card-promo-code-input"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoCodeError(undefined);

                      setDiscount(undefined);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="form-card-promo-code-button"
                    onClick={() => applyPromoCode()}
                    disabled={!promoCode}
                  >
                    {isLoading && <Spinner />} {i18n("apply")}
                  </Button>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium form-card-promo-code-message",
                    promoCodeError
                      ? "text-destructive form-card-promo-code-message-error"
                      : "text-green-700 form-card-promo-code-message-success",
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
        </form>
      </Form>
    </div>
  );
};
