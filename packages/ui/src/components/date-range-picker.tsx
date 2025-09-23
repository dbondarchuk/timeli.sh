"use client";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useI18n } from "@vivid/i18n";
import { DateRange } from "@vivid/types";
import { DateTime } from "luxon";
import * as React from "react";
import { cn } from "../utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type RangeOption = {
  label: string;
  name: string;
  value: DateRange | undefined;
};

export type CalendarDateRangePickerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  range?: DateRange;
  onChange?: (range?: DateRange) => void;
  rangeOptions?: RangeOption[];
};

export const CalendarDateRangePicker: React.FC<
  CalendarDateRangePickerProps
> = ({ className, range, onChange, rangeOptions }) => {
  const t = useI18n("ui");
  const [date, setDate] = React.useState<DateRange | undefined>(range);
  React.useEffect(() => {
    setDate(range);
  }, [range]);

  const onSelect = (range?: DateRange) => {
    setDate(range);
    onChange?.(range);
  };

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.start ? (
              date.end ? (
                <>
                  {DateTime.fromJSDate(date.start).toFormat("LLL dd, y")} -{" "}
                  {DateTime.fromJSDate(date.end).toFormat("LLL dd, y")}
                </>
              ) : (
                DateTime.fromJSDate(date.start).toFormat("LLL dd, y")
              )
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("dateRangePicker.placeholder")}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 flex flex-col md:flex-row gap-2"
          align="end"
        >
          {!!rangeOptions?.length && (
            <div className="flex flex-col gap-1 px-2 py-4">
              {rangeOptions?.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  className="w-full"
                  onClick={() => onSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.start}
            selected={{
              from: date?.start,
              to: date?.end,
            }}
            onSelect={(range) =>
              onSelect(
                range
                  ? {
                      start: range.from
                        ? DateTime.fromJSDate(range.from)
                            .startOf("day")
                            .toJSDate()
                        : undefined,
                      end: range.to
                        ? DateTime.fromJSDate(range.to).endOf("day").toJSDate()
                        : undefined,
                    }
                  : undefined,
              )
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
