import React from "react";

import { cn, FormDescription, Label } from "@vivid/ui";
import { AppSelector, AppSelectorProps } from "@vivid/ui-admin";
import { ResetButton } from "./reset-button";

type Props = Omit<
  AppSelectorProps,
  "value" | "onChange" | "onBlur" | "size" | "allowClear"
> & {
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
  );

export const AppSelectorInput: React.FC<Props> = ({
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
        <AppSelector
          className={cn("w-full", className)}
          {...rest}
          value={value ?? undefined}
          size="sm"
          allowClear={nullable}
          onItemSelect={(v: string | undefined) => {
            setValue(v ?? null);
            onChange((v ?? null) as string);
          }}
        />
        {nullable && (
          <ResetButton
            onClick={() => {
              setValue(null);
              onChange(null);
            }}
            size="sm"
          />
        )}
      </div>
      {helperText && <FormDescription>{helperText}</FormDescription>}
    </div>
  );
};
