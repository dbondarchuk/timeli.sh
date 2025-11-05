import React from "react";

import {
  Input,
  InputGroup,
  InputGroupInput,
  InputGroupInputClasses,
  InputGroupSuffixClasses,
  InputSuffix,
  Label,
} from "@timelish/ui";
import { ResetButton } from "./reset-button";

type TextDimensionInputProps = {
  label: string;
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

export const TextDimensionInput: React.FC<TextDimensionInputProps> = ({
  label,
  defaultValue,
  onChange,
  nullable,
}) => {
  const handleChange = (val: string | null) => {
    const value = parseInt(val ?? "");
    if (nullable) {
      onChange(isNaN(value) ? null : value);
    } else {
      onChange(isNaN(value) ? 0 : value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full">
        <InputGroup>
          <InputGroupInput>
            <Input
              type="number"
              className={InputGroupInputClasses()}
              value={defaultValue?.toString() || ""}
              onChange={(e) => handleChange(e.target.value)}
            />
          </InputGroupInput>
          <InputSuffix className={InputGroupSuffixClasses()}>px</InputSuffix>
        </InputGroup>
        {nullable && <ResetButton onClick={handleChange} />}
      </div>
    </div>
  );
};
