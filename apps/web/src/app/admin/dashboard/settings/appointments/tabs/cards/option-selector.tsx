import { useI18n } from "@vivid/i18n";
import { AppointmentOption, WithTotal } from "@vivid/types";
import { cn, Combobox, IComboboxItem, toast } from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { Clock, DollarSign } from "lucide-react";
import React from "react";

const OptionLabel: React.FC<{ option: AppointmentOption }> = ({ option }) => {
  const t = useI18n("admin");
  const time = option.duration ? durationToTime(option.duration) : null;
  return (
    <span className="flex flex-col justify-center gap-2 shrink overflow-hidden text-nowrap min-w-0">
      {option.name}{" "}
      {time && (
        <div className="inline-flex gap-2 items-center text-xs italic">
          <Clock size={16} />
          {t("settings.appointments.form.cards.optionSelector.time", time)}
        </div>
      )}
      {option.price && (
        <div className="inline-flex gap-2 items-center text-xs italic">
          <DollarSign size={16} /> ${option.price}
        </div>
      )}
    </span>
  );
};

const getOptions = async () => {
  const url = `/admin/api/services/options?limit=0`;
  const response = await fetch(url, {
    method: "GET",
    cache: "default",
  });

  if (response.status >= 400) {
    const text = await response.text();
    const message = `Request to fetch options failed: ${response.status}; ${text}`;
    console.error(message);
    throw new Error(message);
  }

  const res = (await response.json()) as WithTotal<AppointmentOption>;
  return res.items;
};

const checkOptionSearch = (option: AppointmentOption, query: string) => {
  const search = query.toLocaleLowerCase();
  return option.name.toLocaleLowerCase().includes(search);
};

export type OptionSelectorProps = {
  value?: string;
  disabled?: boolean;
  excludeIds?: string[];
  className?: string;
  onItemSelect?: (value: string) => void;
  allowClear?: boolean;
};

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  disabled,
  className,
  excludeIds,
  value,
  onItemSelect,
  allowClear,
}) => {
  const t = useI18n("admin");
  const [options, setOptions] = React.useState<AppointmentOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const fields = await getOptions();
        setOptions(fields);
      } catch (e) {
        toast.error(
          t("settings.appointments.form.cards.optionSelector.requestFailed"),
        );
        console.error(e);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fn();
  }, []);

  const OptionValues = (options: AppointmentOption[]): IComboboxItem[] =>
    options
      .filter(({ _id }) => !excludeIds?.find((id) => id === _id))
      .map((field) => {
        return {
          value: field._id,
          shortLabel: (
            <span className="shrink overflow-hidden text-nowrap min-w-0">
              {field.name}
            </span>
          ),
          label: <OptionLabel option={field} />,
        };
      });

  return (
    <Combobox
      allowClear={allowClear}
      disabled={disabled || isLoading}
      className={cn("flex font-normal text-base", className)}
      values={OptionValues(options)}
      searchLabel={
        isLoading
          ? t("settings.appointments.form.cards.optionSelector.loadingOptions")
          : t("settings.appointments.form.cards.optionSelector.selectOption")
      }
      value={value}
      customSearch={(search) =>
        OptionValues(options.filter((app) => checkOptionSearch(app, search)))
      }
      onItemSelect={onItemSelect as any}
    />
  );
};
