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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@timelish/ui";
import { NonSortable } from "@timelish/ui-admin";
import {
  ReschedulePolicyCard,
  ReschedulePolicyCardContent,
} from "@timelish/ui-admin-kit";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { TabProps } from "./types";

const RescheduleSection: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");
  const {
    fields: policies,
    append: appendPolicy,
    remove: removePolicy,
  } = useFieldArray({
    control: form.control,
    name: `reschedulePolicy.policies`,
    keyName: "fields_id",
  });

  const ids = React.useMemo(() => policies.map((x) => x.fields_id), [policies]);

  const type = form.watch(`reschedulePolicy.type`) ?? "inherit";
  const enabled = !!form.watch(`reschedulePolicy.enabled`);

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
          {t(`services.options.form.reschedulePolicy.title`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name={`reschedulePolicy.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("services.options.form.reschedulePolicy.type.label")}{" "}
                <InfoTooltip>
                  {t(`services.options.form.reschedulePolicy.type.tooltip`)}
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
                        "services.options.form.reschedulePolicy.type.placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">
                      {t("services.options.form.reschedulePolicy.type.inherit")}
                    </SelectItem>
                    <SelectItem value="custom">
                      {t("services.options.form.reschedulePolicy.type.custom")}
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
              name={`reschedulePolicy.enabled`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("services.options.form.reschedulePolicy.enabled.label")}{" "}
                    <InfoTooltip>
                      {t(
                        `services.options.form.reschedulePolicy.enabled.tooltip`,
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
                        "services.options.form.reschedulePolicy.enabled.labels.enabled",
                      )}
                      falseLabel={t(
                        "services.options.form.reschedulePolicy.enabled.labels.disabled",
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
                  name="reschedulePolicy.maxReschedules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "cancellationsAndReschedules.reschedulePolicy.maxReschedules.label",
                        )}
                        <InfoTooltip>
                          {t(
                            "cancellationsAndReschedules.reschedulePolicy.maxReschedules.tooltip",
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
                    "cancellationsAndReschedules.reschedulePolicy.default.title",
                  )}{" "}
                  <InfoTooltip>
                    {t(
                      "cancellationsAndReschedules.reschedulePolicy.default.tooltip",
                    )}
                  </InfoTooltip>
                </h3>
                <ReschedulePolicyCardContent
                  form={form}
                  basePath="reschedulePolicy"
                  disabled={disabled}
                  default
                />
                <NonSortable
                  title={t(
                    "cancellationsAndReschedules.reschedulePolicy.policies.title",
                  )}
                  ids={ids}
                  onAdd={addNew}
                >
                  <div className="flex flex-grow flex-col gap-4">
                    {policies.map((item, index) => {
                      return (
                        <ReschedulePolicyCard
                          form={form}
                          basePath="reschedulePolicy"
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
