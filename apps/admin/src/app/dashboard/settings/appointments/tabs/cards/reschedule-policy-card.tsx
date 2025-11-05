import { useI18n } from "@timelish/i18n";
import {
  appointmentReschedulePolicyActionType,
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

export const ReschedulePolicyCardContent: React.FC<
  {} & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index }) => {
  const t = useI18n("admin");
  const path: FieldPath<BookingConfiguration> = isDefault
    ? `cancellationsAndReschedules.reschedules.defaultPolicy`
    : (`cancellationsAndReschedules.reschedules.policies.${index}` as const);

  const isPaymentRequired = form.watch(`${path}.action`) === "paymentRequired";

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
                  "settings.appointments.form.cards.reschedulePolicy.minutesToAppointment.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.reschedulePolicy.minutesToAppointment.tooltip",
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
                "settings.appointments.form.cards.reschedulePolicy.action.label",
              )}
              <InfoTooltip>
                {t(
                  "settings.appointments.form.cards.reschedulePolicy.action.tooltip",
                )}
              </InfoTooltip>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();

                  if (value === "paymentRequired") {
                    form.setValue(`${path}.paymentPercentage`, 50, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue(`${path}.paymentPercentage`, undefined);
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
                  {appointmentReschedulePolicyActionType.map((action) => (
                    <SelectItem key={action} value={action}>
                      {t(
                        `settings.appointments.form.cards.reschedulePolicy.action.labels.${action}`,
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
      {isPaymentRequired && (
        <FormField
          control={form.control}
          name={`${path}.paymentPercentage`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cards.reschedulePolicy.paymentPercentage.label",
                )}
                <InfoTooltip>
                  {t(
                    "settings.appointments.form.cards.reschedulePolicy.paymentPercentage.tooltip",
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

export const ReschedulePolicyCard: React.FC<
  {
    remove: () => void;
  } & TabProps &
    ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, remove }) => {
  const t = useI18n("admin");

  return (
    <div className="flex flex-row gap-2 px-2 py-4 bg-card rounded w-full">
      <div className="grid grid-cols-1 gap-2 w-full relative">
        <ReschedulePolicyCardContent
          form={form}
          disabled={disabled}
          default={isDefault as any}
          index={index}
        />
      </div>
      <div className="flex flex-row items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="destructive"
              className=""
              size="sm"
              type="button"
              title={t(
                "settings.appointments.form.cards.reschedulePolicy.remove",
              )}
            >
              <Trash size={20} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(
                  "settings.appointments.form.cards.reschedulePolicy.deleteConfirmTitle",
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p>
                  {t(
                    "settings.appointments.form.cards.reschedulePolicy.deleteReschedulePolicyConfirmDescription",
                  )}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("settings.appointments.form.cards.reschedulePolicy.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction asChild variant="destructive">
                <Button onClick={remove}>
                  {t(
                    "settings.appointments.form.cards.reschedulePolicy.delete",
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
