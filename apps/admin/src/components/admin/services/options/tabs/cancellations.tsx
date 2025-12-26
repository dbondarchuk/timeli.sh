import { useI18n } from "@timelish/i18n";
import {
  AppointmentWithDepositCancellationPolicyRow,
  AppointmentWithoutDepositCancellationPolicyRow,
} from "@timelish/types";
import {
  BooleanSelect,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InfoTooltip,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@timelish/ui";
import { NonSortable } from "@timelish/ui-admin";
import {
  CancellationPolicyCard,
  CancellationPolicyCardContent,
} from "@timelish/ui-admin-kit";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { TabProps } from "./types";

const CancellationSection: React.FC<TabProps & { withDeposit: boolean }> = ({
  form,
  disabled,
  withDeposit,
}) => {
  const t = useI18n("admin");
  const baseName =
    `cancellationPolicy.${withDeposit ? "withDeposit" : "withoutDeposit"}` as const;
  const {
    fields: policies,
    append: appendPolicy,
    remove: removePolicy,
  } = useFieldArray({
    control: form.control,
    name: `${baseName}.policies`,
    keyName: "fields_id",
  });

  const ids = React.useMemo(() => policies.map((x) => x.fields_id), [policies]);

  const type = form.watch(`${baseName}.type`) ?? "inherit";
  const enabled = form.watch(`${baseName}.enabled`) ?? false;

  const addNew = () => {
    appendPolicy({
      minutesToAppointment: 0,
      action: "notAllowed",
      note: "",
    } as Partial<
      | AppointmentWithoutDepositCancellationPolicyRow
      | AppointmentWithDepositCancellationPolicyRow
    > as
      | AppointmentWithoutDepositCancellationPolicyRow
      | AppointmentWithDepositCancellationPolicyRow);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            `services.options.form.cancellationPolicy.${withDeposit ? "withDeposit" : "withoutDeposit"}.title`,
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name={`${baseName}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("services.options.form.cancellationPolicy.type.label")}{" "}
                <InfoTooltip>
                  {t(`services.options.form.cancellationPolicy.type.tooltip`)}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? "inherit"}
                  onValueChange={(val) => {
                    field.onChange(val);
                    field.onBlur();
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "services.options.form.cancellationPolicy.type.placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">
                      {t(
                        "services.options.form.cancellationPolicy.type.inherit",
                      )}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t(
                        "services.options.form.cancellationPolicy.type.custom",
                      )}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "custom" && (
          <>
            <FormField
              control={form.control}
              name={`${baseName}.enabled`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("cancellationsAndReschedules.enabled.label")}{" "}
                    <InfoTooltip>
                      {t(
                        `cancellationsAndReschedules.cancellationPolicy.enabledTooltip`,
                      )}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <BooleanSelect
                      disabled={disabled}
                      value={field.value ?? false}
                      onValueChange={(val) => {
                        field.onChange(val);
                        field.onBlur();
                      }}
                      trueLabel={t(
                        `cancellationsAndReschedules.enabled.labels.enabled`,
                      )}
                      falseLabel={t(
                        `cancellationsAndReschedules.enabled.labels.disabled`,
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {enabled && (
              <>
                <FormField
                  control={form.control}
                  name={`${baseName}.doNotAllowIfRescheduled`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "cancellationsAndReschedules.cancellationPolicy.doNotAllowIfRescheduled.label",
                        )}{" "}
                        <InfoTooltip>
                          {t(
                            `cancellationsAndReschedules.cancellationPolicy.doNotAllowIfRescheduled.tooltip`,
                          )}
                        </InfoTooltip>
                      </FormLabel>
                      <FormControl>
                        <BooleanSelect
                          value={field.value ?? false}
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (val) {
                              form.setValue(
                                `${baseName}.policies`,
                                form.getValues(`${baseName}.policies`) ||
                                  ([] as any),
                              );
                            }

                            field.onBlur();

                            form.trigger(`${baseName}.policies`);

                            form.trigger(`${baseName}.defaultPolicy.action`);
                          }}
                          disabled={disabled}
                          trueLabel={t(
                            "cancellationsAndReschedules.cancellationPolicy.doNotAllowIfRescheduled.labels.true",
                          )}
                          falseLabel={t(
                            "cancellationsAndReschedules.cancellationPolicy.doNotAllowIfRescheduled.labels.false",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <h3 className="text-sm font-semibold">
                  {t(
                    "cancellationsAndReschedules.cancellationPolicy.default.title",
                  )}{" "}
                  <InfoTooltip>
                    {t(
                      "cancellationsAndReschedules.cancellationPolicy.default.tooltip",
                    )}
                  </InfoTooltip>
                </h3>
                <CancellationPolicyCardContent
                  basePath="cancellationPolicy"
                  withDeposit={withDeposit}
                  form={form}
                  disabled={disabled}
                  default
                />
                <NonSortable
                  title={t(
                    "cancellationsAndReschedules.cancellationPolicy.policies.title",
                  )}
                  ids={ids}
                  onAdd={addNew}
                >
                  <div className="flex flex-grow flex-col gap-4">
                    {policies.map((item, index) => {
                      return (
                        <CancellationPolicyCard
                          form={form}
                          disabled={disabled}
                          index={index}
                          remove={() => removePolicy(index)}
                          key={item.fields_id}
                          withDeposit={withDeposit}
                          basePath="cancellationPolicy"
                        />
                      );
                    })}
                  </div>
                </NonSortable>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const CancellationsTab: React.FC<TabProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CancellationSection {...props} withDeposit={false} />
      <CancellationSection {...props} withDeposit={true} />
    </div>
  );
};
