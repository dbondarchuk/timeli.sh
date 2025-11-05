import { JSX, useCallback, useId } from "react";

import { cn, FormDescription, Label } from "@timelish/ui";
import { ArgumentsAutocomplete } from "@timelish/ui-admin";
import React from "react";
import { useEditorArgs } from "../../../../../../documents/editor/context";
import { ResetButton } from "./reset-button";

type Props = {
  label: React.ReactNode;
  rows?: number;
  placeholder?: string;
  helperText?: string | JSX.Element;
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
export const TextInput: React.FC<Props> = ({
  helperText,
  label,
  placeholder,
  rows,
  defaultValue,
  nullable,
  onChange,
}) => {
  const [value, setValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const args = useEditorArgs();
  const isMultiline = typeof rows === "number" && rows > 1;
  const id = useId();

  const onChangeCallback = useCallback(
    (value: string) => {
      setValue(value);
      onChange(value);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex w-full">
        {/* @ts-expect-error - TODO: fix this */}
        <ArgumentsAutocomplete
          args={args}
          asInput={!isMultiline}
          className={cn("w-full", isMultiline && "max-h-40")}
          placeholder={placeholder}
          value={value ?? undefined}
          h="sm"
          id={id}
          onChange={onChangeCallback}
        />
        {nullable && (
          <ResetButton
            size="sm"
            onClick={() => {
              setValue(null);
              onChange(null);
            }}
          />
        )}
      </div>
      {helperText && (
        <FormDescription className="text-xs">{helperText}</FormDescription>
      )}
    </div>
  );
};
