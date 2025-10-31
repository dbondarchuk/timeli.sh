import { useI18n } from "@vivid/i18n";
import { CalendarSourceConfiguration } from "@vivid/types";
import { NonSortable } from "@vivid/ui-admin";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { CalendarSourceCard } from "./cards/calendar-source-card";
import { TabProps } from "./types";

export const CalendarSourcesTab: React.FC<TabProps> = ({ form, disabled }) => {
  const t = useI18n("admin");
  const { fields, append, remove, swap, update, insert } = useFieldArray({
    control: form.control,
    name: "calendarSources",
    keyName: "fields_id",
  });

  const ids = React.useMemo(() => fields.map((x) => x.fields_id), [fields]);

  const addNew = () => {
    append({
      type: "ics",
    } as Partial<CalendarSourceConfiguration> as CalendarSourceConfiguration);
  };

  const clone = (index: number) => {
    insert(index + 1, {
      ...form.getValues(`calendarSources.${index}`)!,
    });
  };

  return (
    <NonSortable
      title={t("settings.appointments.form.calendarSources.title")}
      ids={ids}
      onAdd={addNew}
    >
      <div className="flex flex-grow flex-col gap-4">
        {fields.map((item, index) => {
          return (
            <CalendarSourceCard
              form={form}
              item={item}
              key={item.fields_id}
              name={`calendarSources.${index}`}
              disabled={disabled}
              remove={() => remove(index)}
              clone={() => clone(index)}
              update={(newValue) => update(index, newValue)}
              excludeIds={form
                .getValues("calendarSources")
                ?.map(({ appId }) => appId)
                .filter(
                  (appId) =>
                    appId !== form.getValues(`calendarSources.${index}`)?.appId,
                )}
            />
          );
        })}
      </div>
    </NonSortable>
  );
};
