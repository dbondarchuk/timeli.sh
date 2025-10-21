import { adminApi } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import { AppointmentAddon } from "@vivid/types";
import {
  cn,
  Combobox,
  IComboboxItem,
  MultiSelect,
  OptionType,
} from "@vivid/ui";
import { durationToTime } from "@vivid/utils";
import { Clock, DollarSign } from "lucide-react";
import React from "react";

const AddonLabel: React.FC<{ addon: AppointmentAddon }> = ({ addon }) => {
  const time = addon.duration ? durationToTime(addon.duration) : null;
  return (
    <span className="flex flex-col justify-center gap-2 shrink overflow-hidden text-nowrap min-w-0">
      {addon.name}{" "}
      {time && (
        <div className="inline-flex gap-2 items-center text-xs italic">
          <Clock size={16} /> {`${time.hours}hr ${time.minutes}min`}
        </div>
      )}
      {addon.price && (
        <div className="inline-flex gap-2 items-center text-xs italic">
          <DollarSign size={16} /> ${addon.price}
        </div>
      )}
    </span>
  );
};

const getAddons = async () => {
  const response = await adminApi.serviceAddons.getServiceAddons({
    limit: 10000,
  });

  return response.items;
};

const checkAddonSearch = (addon: AppointmentAddon, query: string) => {
  const search = query.toLocaleLowerCase();
  return addon.name.toLocaleLowerCase().includes(search);
};

export type AddonSelectorProps = {
  disabled?: boolean;
  excludeIds?: string[];
  className?: string;
} & (
  | {
      onItemSelect?: (value: string) => void;
      value?: string;
      multi?: false;
    }
  | {
      multi: true;
      onItemSelect?: (value: string[]) => void;
      value?: string[];
    }
);

export const AddonSelector: React.FC<AddonSelectorProps> = ({
  disabled,
  className,
  excludeIds,
  value,
  onItemSelect,
  multi,
}) => {
  const t = useI18n("admin");
  const [addons, setAddons] = React.useState<AppointmentAddon[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const fields = await getAddons();
        setAddons(fields);
      } finally {
        setIsLoading(false);
      }
    };

    fn();
  }, []);

  const addonValues = (addons: AppointmentAddon[]): IComboboxItem[] =>
    addons
      .filter(({ _id }) => !excludeIds?.find((id) => id === _id))
      .map((field) => {
        return {
          value: field._id,
          shortLabel: (
            <span className="shrink overflow-hidden text-nowrap min-w-0">
              {field.name}
            </span>
          ),
          label: <AddonLabel addon={field} />,
        };
      });

  const addonMultiOptions = (addons: AppointmentAddon[]): OptionType[] =>
    addons
      .filter(({ _id }) => !excludeIds?.find((id) => id === _id))
      .map((addon) => {
        return {
          value: addon._id,
          label: addon.name,
        };
      });

  return multi ? (
    <MultiSelect
      disabled={disabled || isLoading}
      className={cn("flex font-normal text-base", className)}
      options={addonMultiOptions(addons)}
      placeholder={
        isLoading
          ? t("services.addonSelector.loading")
          : t("services.addonSelector.selectAddon")
      }
      selected={value || []}
      onChange={onItemSelect}
    />
  ) : (
    <Combobox
      disabled={disabled || isLoading}
      className={cn("flex font-normal text-base", className)}
      values={addonValues(addons)}
      searchLabel={
        isLoading
          ? t("services.addonSelector.loading")
          : t("services.addonSelector.selectAddon")
      }
      value={value}
      customSearch={(search) =>
        addonValues(addons.filter((app) => checkAddonSearch(app, search)))
      }
      onItemSelect={onItemSelect}
    />
  );
};
