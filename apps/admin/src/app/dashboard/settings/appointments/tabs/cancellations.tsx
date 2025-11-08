import { useI18n } from "@timelish/i18n";
import {
  AppointmentCancellationPolicyRow,
  AppointmentReschedulePolicyRow,
  modifyEnabledType,
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@timelish/ui";
import { NonSortable } from "@timelish/ui-admin";
import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  CancellationPolicyCard,
  CancellationPolicyCardContent,
} from "./cards/cancellation-policy-card";
import {
  ReschedulePolicyCard,
  ReschedulePolicyCardContent,
} from "./cards/reschedule-policy-card";
import { TabProps } from "./types";

const CancellationSection: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");
  const {
    fields: policies,
    append: appendPolicy,
    remove: removePolicy,
  } = useFieldArray({
    control: form.control,
    name: `cancellationsAndReschedules.cancellations.policies`,
    keyName: "fields_id",
  });

  const ids = React.useMemo(() => policies.map((x) => x.fields_id), [policies]);

  const enabledValue = form.watch(
    `cancellationsAndReschedules.cancellations.enabled`,
  );

  const enabled = enabledValue && enabledValue !== "disabled";

  const addNew = () => {
    appendPolicy({
      minutesToAppointment: 0,
      action: "notAllowed",
      note: "",
    } as Partial<AppointmentCancellationPolicyRow> as AppointmentCancellationPolicyRow);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            `settings.appointments.form.cancellationsAndReschedules.cancellations.title`,
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name={`cancellationsAndReschedules.cancellations.enabled`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cancellationsAndReschedules.enabled.label",
                )}{" "}
                <InfoTooltip>
                  {t(
                    `settings.appointments.form.cancellationsAndReschedules.cancellations.enabledTooltip`,
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val) {
                      form.setValue(
                        `cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled`,
                        true,
                      );
                      form.setValue(
                        `cancellationsAndReschedules.cancellations.policies`,
                        form.getValues(
                          `cancellationsAndReschedules.cancellations.policies`,
                        ) || ([] as any),
                      );
                    }

                    field.onBlur();

                    form.trigger(
                      `cancellationsAndReschedules.cancellations.policies`,
                    );

                    form.trigger(
                      `cancellationsAndReschedules.cancellations.defaultPolicy.action`,
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "settings.appointments.form.cancellationsAndReschedules.enabled.selectPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {modifyEnabledType.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(
                          `settings.appointments.form.cancellationsAndReschedules.enabled.labels.${type}`,
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
        {enabled && (
          <>
            <FormField
              control={form.control}
              name={`cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      "settings.appointments.form.cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled.label",
                    )}{" "}
                    <InfoTooltip>
                      {t(
                        `settings.appointments.form.cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled.tooltip`,
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
                            `cancellationsAndReschedules.cancellations.policies`,
                            form.getValues(
                              `cancellationsAndReschedules.cancellations.policies`,
                            ) || ([] as any),
                          );
                        }

                        field.onBlur();

                        form.trigger(
                          `cancellationsAndReschedules.cancellations.policies`,
                        );

                        form.trigger(
                          `cancellationsAndReschedules.cancellations.defaultPolicy.action`,
                        );
                      }}
                      disabled={disabled}
                      trueLabel={t(
                        "settings.appointments.form.cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled.labels.true",
                      )}
                      falseLabel={t(
                        "settings.appointments.form.cancellationsAndReschedules.cancellations.doNotAllowIfRescheduled.labels.false",
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3 className="text-sm font-semibold">
              {t(
                "settings.appointments.form.cancellationsAndReschedules.cancellationPolicy.default.title",
              )}{" "}
              <InfoTooltip>
                {t(
                  "settings.appointments.form.cancellationsAndReschedules.cancellationPolicy.default.tooltip",
                )}
              </InfoTooltip>
            </h3>
            <CancellationPolicyCardContent
              form={form}
              disabled={disabled}
              default
            />
            <NonSortable
              title={t(
                "settings.appointments.form.cancellationsAndReschedules.cancellationPolicy.policies.title",
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
                    />
                  );
                })}
              </div>
            </NonSortable>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const RescheduleSection: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");
  const {
    fields: policies,
    append: appendPolicy,
    remove: removePolicy,
  } = useFieldArray({
    control: form.control,
    name: `cancellationsAndReschedules.reschedules.policies`,
    keyName: "fields_id",
  });

  const ids = React.useMemo(() => policies.map((x) => x.fields_id), [policies]);

  const enabledValue = form.watch(
    `cancellationsAndReschedules.reschedules.enabled`,
  );

  const enabled = enabledValue && enabledValue !== "disabled";
  const addNew = () => {
    appendPolicy({
      minutesToAppointment: 0,
      action: "notAllowed",
      note: "",
    } as Partial<AppointmentReschedulePolicyRow> as AppointmentReschedulePolicyRow);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t(
            `settings.appointments.form.cancellationsAndReschedules.reschedules.title`,
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name={`cancellationsAndReschedules.reschedules.enabled`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(
                  "settings.appointments.form.cancellationsAndReschedules.enabled.label",
                )}{" "}
                <InfoTooltip>
                  {t(
                    `settings.appointments.form.cancellationsAndReschedules.reschedules.enabledTooltip`,
                  )}
                </InfoTooltip>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val) {
                      form.setValue(
                        `cancellationsAndReschedules.reschedules.maxReschedules`,
                        1,
                      );
                    }

                    field.onBlur();

                    form.trigger(
                      `cancellationsAndReschedules.reschedules.policies`,
                    );

                    form.trigger(
                      `cancellationsAndReschedules.reschedules.defaultPolicy.action`,
                    );

                    form.trigger(
                      `cancellationsAndReschedules.reschedules.maxReschedules`,
                    );
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "settings.appointments.form.cancellationsAndReschedules.enabled.selectPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {modifyEnabledType.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(
                          `settings.appointments.form.cancellationsAndReschedules.enabled.labels.${type}`,
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
        {enabled && (
          <>
            <FormField
              control={form.control}
              name="cancellationsAndReschedules.reschedules.maxReschedules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      "settings.appointments.form.cancellationsAndReschedules.reschedules.maxReschedules.label",
                    )}
                    <InfoTooltip>
                      {t(
                        "settings.appointments.form.cancellationsAndReschedules.reschedules.maxReschedules.tooltip",
                      )}
                    </InfoTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled}
                      type="number"
                      inputMode="decimal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3 className="text-sm font-semibold">
              {t(
                "settings.appointments.form.cancellationsAndReschedules.cancellationPolicy.default.title",
              )}{" "}
              <InfoTooltip>
                {t(
                  "settings.appointments.form.cancellationsAndReschedules.cancellationPolicy.default.tooltip",
                )}
              </InfoTooltip>
            </h3>
            <ReschedulePolicyCardContent
              form={form}
              disabled={disabled}
              default
            />
            <NonSortable
              title={t(
                "settings.appointments.form.cancellationsAndReschedules.reschedulePolicy.policies.title",
              )}
              ids={ids}
              onAdd={addNew}
            >
              <div className="flex flex-grow flex-col gap-4">
                {policies.map((item, index) => {
                  return (
                    <ReschedulePolicyCard
                      form={form}
                      disabled={disabled}
                      index={index}
                      remove={() => removePolicy(index)}
                      key={item.fields_id}
                    />
                  );
                })}
              </div>
            </NonSortable>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const CancellationsAndReschedulesTab: React.FC<TabProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CancellationSection {...props} />
      <RescheduleSection {...props} />
    </div>
  );
};
