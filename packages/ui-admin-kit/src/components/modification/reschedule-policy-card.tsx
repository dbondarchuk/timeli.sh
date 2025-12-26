import { useI18n } from "@timelish/i18n";
import {
  appointmentReschedulePolicyActionType,
  modificationPaymentCalculationType,
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
import { UseFormReturn } from "react-hook-form";

export const ReschedulePolicyCardContent: React.FC<
  {
    basePath: string;
    form: UseFormReturn<any>;
    disabled?: boolean;
  } & ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, basePath }) => {
  const t = useI18n("admin");
  const path = isDefault
    ? `${basePath}.defaultPolicy`
    : (`${basePath}.policies.${index}` as const);

  const isPaymentRequired = form.watch(`${path}.action`) === "paymentRequired";
  const isPaymentAmountType = form.watch(`${path}.paymentType`) === "amount";

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
                  "cancellationsAndReschedules.reschedulePolicy.minutesToAppointment.label",
                )}
                <InfoTooltip>
                  {t(
                    "cancellationsAndReschedules.reschedulePolicy.minutesToAppointment.tooltip",
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
              {t("cancellationsAndReschedules.reschedulePolicy.action.label")}
              <InfoTooltip>
                {t(
                  "cancellationsAndReschedules.reschedulePolicy.action.tooltip",
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
                    form.setValue(`${path}.paymentType`, "percentage", {
                      shouldValidate: true,
                    });
                    form.setValue(`${path}.paymentPercentage`, 50, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue(`${path}.paymentType`, undefined);
                    form.setValue(`${path}.paymentAmount`, undefined);
                    form.setValue(`${path}.paymentPercentage`, undefined);
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "cancellationsAndReschedules.reschedulePolicy.action.placeholder",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {appointmentReschedulePolicyActionType.map((action) => (
                    <SelectItem key={action} value={action}>
                      {t(
                        `cancellationsAndReschedules.reschedulePolicy.action.labels.${action}`,
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
        <>
          <FormField
            control={form.control}
            name={`${path}.paymentType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    "cancellationsAndReschedules.reschedulePolicy.paymentType.label",
                  )}
                  <InfoTooltip>
                    {t(
                      "cancellationsAndReschedules.reschedulePolicy.paymentType.tooltip",
                    )}
                  </InfoTooltip>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      field.onBlur();

                      if (value === "amount") {
                        form.setValue(`${path}.paymentAmount`, 20, {
                          shouldValidate: true,
                        });
                      } else {
                        form.setValue(`${path}.paymentPercentage`, 50, {
                          shouldValidate: true,
                        });
                      }
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "cancellationsAndReschedules.reschedulePolicy.paymentType.placeholder",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {modificationPaymentCalculationType.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(
                            `cancellationsAndReschedules.reschedulePolicy.paymentType.labels.${type}`,
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
          {isPaymentAmountType ? (
            <FormField
              control={form.control}
              name={`${path}.paymentAmount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      "cancellationsAndReschedules.reschedulePolicy.paymentAmount.label",
                    )}
                    <InfoTooltip>
                      {t(
                        "cancellationsAndReschedules.reschedulePolicy.paymentAmount.tooltip",
                      )}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputSuffix
                        className={InputGroupSuffixClasses({
                          variant: "prefix",
                        })}
                      >
                        $
                      </InputSuffix>
                      <InputGroupInput>
                        <Input
                          {...field}
                          disabled={disabled}
                          type="number"
                          min={0}
                          inputMode="decimal"
                          step={1}
                          className={InputGroupInputClasses({
                            variant: "prefix",
                          })}
                        />
                      </InputGroupInput>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name={`${path}.calculateFromOriginalPrice` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        "cancellationsAndReschedules.reschedulePolicy.calculateFromOriginalPrice.label",
                      )}
                      <InfoTooltip>
                        {t(
                          "cancellationsAndReschedules.reschedulePolicy.calculateFromOriginalPrice.tooltip",
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
              <FormField
                control={form.control}
                name={`${path}.paymentPercentage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        "cancellationsAndReschedules.reschedulePolicy.paymentPercentage.label",
                      )}
                      <InfoTooltip>
                        {t(
                          "cancellationsAndReschedules.reschedulePolicy.paymentPercentage.tooltip",
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
            </>
          )}
        </>
      )}
    </>
  );
};

export const ReschedulePolicyCard: React.FC<
  {
    remove: () => void;
    basePath: string;
    form: UseFormReturn<any>;
    disabled?: boolean;
  } & ({ default: true; index?: never } | { default?: false; index: number })
> = ({ form, disabled, default: isDefault, index, remove, basePath }) => {
  const t = useI18n("admin");

  return (
    <div className="flex flex-col gap-2 px-2 py-4 bg-card border rounded w-full">
      <div className="grid grid-cols-1 gap-2 w-full relative">
        <ReschedulePolicyCardContent
          form={form}
          disabled={disabled}
          default={isDefault as any}
          index={index}
          basePath={basePath}
        />
      </div>
      <div className="flex flex-row items-start">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={disabled}
              variant="ghost-destructive"
              size="icon"
              type="button"
              className="w-full hover:z-[1]"
              title={t("cancellationsAndReschedules.reschedulePolicy.remove")}
            >
              <Trash />{" "}
              <span>
                {t("cancellationsAndReschedules.reschedulePolicy.remove")}
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t(
                  "cancellationsAndReschedules.reschedulePolicy.deleteConfirmTitle",
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p>
                  {t(
                    "cancellationsAndReschedules.reschedulePolicy.deleteReschedulePolicyConfirmDescription",
                  )}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("cancellationsAndReschedules.reschedulePolicy.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction asChild variant="destructive">
                <Button onClick={remove}>
                  {t("cancellationsAndReschedules.reschedulePolicy.delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
