import React from "react";

import { Label } from "@timelish/ui";
import { RawSliderInput } from "./raw/raw-slider-input";
import { ResetButton } from "./reset-button";

type SliderInputProps = {
  label: string;
  iconLabel: React.JSX.Element;

  step?: number;
  units: string;
  min?: number;
  max?: number;
} & (
  | {
      defaultValue: number;
      onChange: (v: number) => void;
      nullable?: false;
    }
  | {
      defaultValue: number | null;
      onChange: (v: number | null) => void;
      nullable: true;
    }
);

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  defaultValue,
  onChange,
  nullable,
  ...props
}) => {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full">
        <RawSliderInput
          value={value}
          setValue={(value: number) => {
            setValue(value);
            onChange(value);
          }}
          {...props}
        />
        {nullable && (
          <ResetButton
            onClick={() => {
              setValue(null);
              onChange(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
