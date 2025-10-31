import { useI18n } from "@vivid/i18n";
import { Combobox, IComboboxItem, Icon } from "@vivid/ui";
// import { icons } from "lucide-react";
import { icons } from "@vivid/ui";
import { ControllerRenderProps } from "react-hook-form";

export type IconSelectProps = {
  field: ControllerRenderProps;
  disabled?: boolean;
  allowClear?: boolean;
};

const iconValues = Object.keys(icons).map(
  (icon) =>
    ({
      value: icon,
      label: (
        <div className="flex flex-row gap-1 items-center">
          <Icon name={icon as keyof typeof icons} size={20} /> {icon}
        </div>
      ),
    }) as IComboboxItem,
);

export const IconSelect: React.FC<IconSelectProps> = ({
  field,
  disabled,
  allowClear,
}) => {
  const t = useI18n("admin");

  return (
    <Combobox
      className="flex w-full font-normal text-base"
      values={iconValues}
      searchLabel={t("menuItem.iconSelect.selectIcon")}
      disabled={disabled}
      customSearch={(search) =>
        iconValues.filter(
          (icon) =>
            icon.value
              .toLocaleLowerCase()
              .indexOf(search.toLocaleLowerCase()) >= 0,
        )
      }
      value={field.value}
      onItemSelect={(value: string | undefined) => field.onChange(value)}
      allowClear={allowClear}
    />
  );
};
