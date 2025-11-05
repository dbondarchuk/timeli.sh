import React from "react";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { RadioGroupInput } from "./radio-group-input";
import { RadioGroupInputItem } from "./radio-group-input-item";

type Props = {
  label: string;
} & (
  | {
      defaultValue: string;
      onChange: (v: string) => void;
      nullable?: false;
    }
  | {
      defaultValue: string | null;
      onChange: (v: string | null) => void;
      nullable: true;
    }
);

export const TextAlignInput: React.FC<Props> = ({
  label,
  defaultValue,
  onChange,
  nullable,
}) => {
  const [value, setValue] = React.useState(
    (defaultValue ?? !nullable) ? "left" : null,
  );

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  return (
    <RadioGroupInput
      label={label}
      defaultValue={value as string}
      nullable={nullable}
      onChange={(value: string | null) => {
        setValue(value);
        onChange(value as string);
      }}
    >
      <RadioGroupInputItem value="left">
        <AlignLeft /> Left
      </RadioGroupInputItem>
      <RadioGroupInputItem value="center">
        <AlignCenter /> Center
      </RadioGroupInputItem>
      <RadioGroupInputItem value="right">
        <AlignRight /> Right
      </RadioGroupInputItem>
    </RadioGroupInput>
  );
};
