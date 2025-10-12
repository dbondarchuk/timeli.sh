import { useI18n } from "@vivid/i18n";
import { Combobox } from "@vivid/ui";
import { BaseStyleDictionary } from "../../style/types";
import { ShortcutOption, ShortcutWithCombobox } from "../types";

export const ComboboxShortcut = <T extends BaseStyleDictionary>({
  shortcut,
  currentValue,
  applyShortcut,
}: {
  shortcut: ShortcutWithCombobox<T>;
  currentValue: string;
  applyShortcut: (option: ShortcutOption<T>) => void;
}) => {
  const t = useI18n("builder");
  return (
    <Combobox
      values={shortcut.options.map((option) => ({
        label: (
          <span style={option.labelStyle}>
            {t.has(option.label) ? t(option.label) : option.label}
          </span>
        ),
        value: option.value,
      }))}
      value={currentValue as any}
      onItemSelect={(value) => {
        const selectedOption = shortcut.options.find(
          (opt) => opt.value === value,
        );
        if (selectedOption) {
          applyShortcut(selectedOption);
        }
      }}
      className="w-full"
      size="xs"
    />
  );
};
