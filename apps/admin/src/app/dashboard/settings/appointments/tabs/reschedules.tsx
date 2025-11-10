import { useI18n } from "@timelish/i18n";
import { AppointmentReschedulePolicyRow } from "@timelish/types";
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
} from "@timelish/ui";
import { NonSortable } from "@timelish/ui-admin";
import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  ReschedulePolicyCard,
  ReschedulePolicyCardContent,
} from "./cards/reschedule-policy-card";
import { TabProps } from "./types";

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

  const enabled = !!form.watch(
    `cancellationsAndReschedules.reschedules.enabled`,
  );

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
                <BooleanSelect
                  value={field.value ?? false}
                  onValueChange={(val) => {
                    field.onChange(val);
                    field.onBlur();
                  }}
                  trueLabel={t(
                    "settings.appointments.form.cancellationsAndReschedules.enabled.labels.enabled",
                  )}
                  falseLabel={t(
                    "settings.appointments.form.cancellationsAndReschedules.enabled.labels.disabled",
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

export const ReschedulesTab: React.FC<TabProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RescheduleSection {...props} />
    </div>
  );
};
