"use client";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@vivid/ui";
import { Minus, Plus } from "lucide-react";
import React from "react";

type RawNumberInputProps = {
  iconLabel: React.JSX.Element;
  step?: number;
  min?: number;
  max?: number;
  options: number[];
  float?: boolean;
  id?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
} & (
  | {
      nullable?: false;
      value?: number;
      setValue: (v: number) => void;
    }
  | {
      nullable: true;
      value?: number | null;
      setValue: (v: number | null) => void;
    }
);

export const RawNumberInput: React.FC<RawNumberInputProps> = ({
  iconLabel,
  value,
  setValue,
  nullable,
  options,
  min,
  max,
  step = 1,
  float,
  id: propId,
  disabled,
  suffix,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const handleInputChange = React.useCallback(
    (value: number | null) => {
      if (value === null && !nullable) return;
      if (
        value !== null &&
        ((typeof min !== "undefined" && value < min) ||
          (typeof max !== "undefined" && value > max))
      ) {
        if (nullable) setValue(null);
        return;
      }

      setValue(value as number);
    },
    [setValue, nullable, min, max],
  );

  const parseFn = (val: string) =>
    val.length === 0 ? null : float ? parseFloat(val) : parseInt(val);

  const handleDeltaChange = (delta: number) => {
    const newSize = parseFloat(Number((value ?? 0) + delta).toFixed(10));
    handleInputChange(newSize);
  };

  const id = React.useId();
  const inputId = propId ?? id;

  return (
    <div className="flex flex-row gap-0.5 items-center grow w-full">
      <label className="min-w-6 shrink-0 cursor-pointer" htmlFor={inputId}>
        {iconLabel}
      </label>

      <div className="flex flex-row gap-0.5 items-center justify-center grow w-full">
        <Button
          onClick={() => handleDeltaChange(-step)}
          variant="ghost"
          size="sm"
          disabled={disabled}
          // className="w-6 h-6"
        >
          <Minus className="" />
        </Button>

        <Popover open={isFocused} modal={false}>
          <PopoverTrigger asChild>
            <input
              className={cn(
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-8 min-w-10 max-w-12 shrink bg-transparent text-foreground px-1 text-center text-sm hover:bg-muted disabled:text-muted-foreground",
              )}
              value={value?.toString()}
              onBlur={() => {
                setIsFocused(false);
              }}
              onChange={(e) => handleInputChange(parseFn(e.target.value))}
              onFocus={() => {
                setIsFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInputChange(parseFn(e.currentTarget.value));
                  setIsFocused(false);
                }
              }}
              data-plate-focus="true"
              type="number"
              id={inputId}
              disabled={disabled}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-10 px-px py-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {options.map((option) => (
              <button
                key={option}
                className={cn(
                  "flex h-8 w-full items-center justify-center text-sm hover:bg-accent data-[highlighted=true]:bg-accent",
                )}
                onClick={() => {
                  handleInputChange(option);
                }}
                data-highlighted={option.toString() === value?.toString()}
                type="button"
              >
                {option}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Button
          onClick={() => handleDeltaChange(step)}
          variant="ghost"
          size="sm"
          disabled={disabled}
          // className="w-6 h-6"
        >
          <Plus className="" />
        </Button>
      </div>
      {suffix && (
        <label className="min-w-6 shrink-0 cursor-pointer" htmlFor={inputId}>
          {suffix}
        </label>
      )}
    </div>
  );
};
