import React from "react";

import { Prettify } from "@vivid/types";
import {
  AssetSelectorInput,
  AssetSelectorInputProps,
  cn,
  FormDescription,
  Label,
} from "@vivid/ui";
import { ResetButton } from "./reset-button";

type Props = Prettify<
  Omit<AssetSelectorInputProps, "value" | "onChange" | "onBlur"> & {
    label: string;
    helperText?: string | React.JSX.Element;
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
    )
>;

export const FileInput: React.FC<Props> = ({
  helperText,
  label,
  defaultValue,
  onChange,
  nullable,
  className,
  ...rest
}) => {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex w-full">
        <AssetSelectorInput
          className={cn("w-full", className)}
          h="sm"
          {...rest}
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
        {nullable && (
          <ResetButton
            size={rest.h ?? "sm"}
            onClick={() => {
              setValue(null);
              onChange(null);
            }}
          />
        )}
      </div>
      {helperText && <FormDescription>{helperText}</FormDescription>}
    </div>
  );
};
