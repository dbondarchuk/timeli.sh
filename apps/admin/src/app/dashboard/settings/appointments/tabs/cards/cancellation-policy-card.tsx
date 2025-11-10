import { useI18n } from "@timelish/i18n";
import {
  appointmentWithDepositCancellationPolicyActionType,
  appointmentWithoutDepositCancellationPolicyActionType,
} from "@timelish/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  BooleanSelect,
  Button,
  DurationInput,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@timelish/ui";
import { Trash } from "lucide-react";
import React from "react";
import { TabProps } from "../types";

function getPath<TDeposit extends boolean, TDefault extends boolean>(
  withDeposit: TDeposit,
  isDefault: TDefault,
  index: number,
): TDeposit extends true
  ? TDefault extends true
    ? `cancellationsAndReschedules.cancellations.withDeposit.defaultPolicy`
    : `cancellationsAndReschedules.cancellations.withDeposit.policies.${number}`
  : TDefault extends true
    ? `cancellationsAndReschedules.cancellations.withoutDeposit.defaultPolicy`
    : `cancellationsAndReschedules.cancellations.withoutDeposit.policies.${number}` {
  return `cancellationsAndReschedules.cancellations.${withDeposit ? "withDeposit" : "withoutDeposit"}.${isDefault ? "defaultPolicy" : `policies.${index}`}` as const as any;
}

export const CancellationPolicyCardContent: React.FC<
  { withDeposit: boolean } & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, withDeposit }) => {
  const t = useI18n("admin");

  const path = getPath(withDeposit, isDefault ?? false, index ?? 0);

  const action = form.watch(`${path}.action`);
  const isPartialRefund = action === "partialRefund";
  const isFullRefund = action === "fullRefund";
  const isPaymentRequired = action === "paymentRequired";
  const isPaymentToFullPriceRequired = action === "paymentToFullPriceRequired";

  return (
    <>
      {!isDefault && (
        <FormField
          control={form.control}
          name={`${path}.minutesToAppointment` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.minutesToAppointment.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.minutesToAppointment.tooltip",
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <DurationInput
                  type="weeks-days-hours-minutes"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name={`${path}.action`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(
                "settings.appointments.form.cards.cancellationPolicy.action.label",
              )}
              <InfoTooltip>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.action.tooltip",
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();

                  if (withDeposit && value === "partialRefund") {
                    form.setValue(`${path}.refundPercentage` as any, 50, {
                      shouldValidate: true,
                    });
                  } else if (value === "paymentRequired") {
                    form.setValue(`${path}.paymentPercentage` as any, 50, {
                      shouldValidate: true,
                    });
                  } else if (withDeposit) {
                    form.setValue(`${path}.refundPercentage` as any, undefined);
                  } else {
                    form.setValue(`${path}.refundPercentage` as any, undefined);
                    form.setValue(
                      `${path}.paymentPercentage` as any,
                      undefined,
                    );
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "settings.appointments.form.cards.cancellationPolicy.action.placeholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(withDeposit
                    ? appointmentWithDepositCancellationPolicyActionType
                    : appointmentWithoutDepositCancellationPolicyActionType
                  ).map((action) => (
                    <SelectItem key={action} value={action}>
                      {t(
                        `settings.appointments.form.cards.cancellationPolicy.action.labels.${action}`,
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {withDeposit && (isPartialRefund || isFullRefund) && (
        <FormField
          control={form.control}
          name={`${path}.refundFees` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.refundFees.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.refundFees.tooltip",
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <BooleanSelect
                  value={field.value ?? false}
                  onValueChange={(val) => {
                    field.onChange(val);
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {withDeposit && isPartialRefund && (
        <FormField
          control={form.control}
          name={`${path}.refundPercentage` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.refundPercentage.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.refundPercentage.tooltip",
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput>
                    <Input
                      {...field}
                      disabled={disabled}
                      type="number"
                      min={0}
                      max={100}
                      inputMode="decimal"
                      step={1}
                      className={InputGroupInputClasses({
                        variant: "suffix",
                      })}
                    />
                  </InputGroupInput>
                  <InputSuffix
                    className={InputGroupSuffixClasses({
                      variant: "suffix",
                    })}
                  >
                    %
                  </InputSuffix>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {isPaymentRequired && (
        <FormField
          control={form.control}
          name={`${path}.paymentPercentage`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.paymentPercentage.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.paymentPercentage.tooltip",
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput>
                    <Input
                      {...field}
                      disabled={disabled}
                      type="number"
                      min={0}
                      max={100}
                      inputMode="decimal"
                      step={1}
                      className={InputGroupInputClasses({
                        variant: "suffix",
                      })}
                    />
                  </InputGroupInput>
                  <InputSuffix
                    className={InputGroupSuffixClasses({
                      variant: "suffix",
                    })}
                  >
                    %
                  </InputSuffix>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export const CancellationPolicyCard: React.FC<
  {
    remove: () => void;
    withDeposit: boolean;
  } & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, remove, withDeposit }) => {
  const t = useI18n("admin");

  return (
    <div className="flex flex-col md:flex-row gap-2 px-2 py-4 bg-card border rounded w-full">
      <div className="grid grid-cols-1 gap-2 w-full relative">
        <CancellationPolicyCardContent
          form={form}
          disabled={disabled}
          default={isDefault as any}
          index={index}
          withDeposit={withDeposit}
        />
      </div>
      <div className="flex flex-row items-start">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="ghost-destructive"
              className="max-md:w-full"
              size="icon"
              type="button"
              title={t(
                "settings.appointments.form.cards.cancellationPolicy.remove",
              )}
            >
              <Trash />{" "}
              <span className="md:hidden">
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.remove",
                )}
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.deleteConfirmTitle",
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.deleteCancellationPolicyConfirmDescription",
                  )}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t(
                  "settings.appointments.form.cards.cancellationPolicy.cancel",
                )}
              </AlertDialogCancel>
              <AlertDialogAction asChild variant="destructive">
                <Button onClick={remove}>
                  {t(
                    "settings.appointments.form.cards.cancellationPolicy.delete",
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
