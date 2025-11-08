import { useI18n } from "@timelish/i18n";
import {
  appointmentCancellationPolicyActionType,
  BookingConfiguration,
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
import { FieldPath } from "react-hook-form";
import { TabProps } from "../types";

export const CancellationPolicyCardContent: React.FC<
  {} & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index }) => {
  const t = useI18n("admin");
  const path: FieldPath<BookingConfiguration> = isDefault
    ? `cancellationsAndReschedules.cancellations.defaultPolicy`
    : (`cancellationsAndReschedules.cancellations.policies.${index}` as const);

  const action = form.watch(`${path}.action`);
  const isPartialRefund = action === "partialRefund";
  const isFullRefund = action === "fullRefund";

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

                  if (value === "partialRefund") {
                    form.setValue(`${path}.refundPercentage`, 50, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue(`${path}.refundPercentage`, undefined);
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
                  {appointmentCancellationPolicyActionType.map((action) => (
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
      {(isPartialRefund || isFullRefund) && (
        <FormField
          control={form.control}
          name={`${path}.refundFees`}
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
      {isPartialRefund && (
        <FormField
          control={form.control}
          name={`${path}.refundPercentage`}
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
    </>
  );
};

export const CancellationPolicyCard: React.FC<
  {
    remove: () => void;
  } & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, remove }) => {
  const t = useI18n("admin");

  return (
    <div className="flex flex-row gap-2 px-2 py-4 bg-card border rounded w-full">
      <div className="grid grid-cols-1 gap-2 w-full relative">
        <CancellationPolicyCardContent
          form={form}
          disabled={disabled}
          default={isDefault as any}
          index={index}
        />
      </div>
      <div className="flex flex-row items-start">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="ghost-destructive"
              className=""
              size="icon"
              type="button"
              title={t(
                "settings.appointments.form.cards.cancellationPolicy.remove",
              )}
            >
              <Trash />
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
