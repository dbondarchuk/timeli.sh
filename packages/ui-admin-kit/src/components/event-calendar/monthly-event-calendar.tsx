import { useI18n, useLocale } from "@vivid/i18n";
import {
  Button,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useTimeZone,
} from "@vivid/ui";
import { formatTimeLocale, hasSame, parseTime } from "@vivid/utils";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { EventPopover } from "./event-popover";
import { EventVariantClasses } from "./styles";
import { MonthlyEventCalendarProps } from "./types";

const getDates = (currentDate: DateTime) => {
  const monthStart = currentDate.startOf("month");
  const monthEnd = currentDate.endOf("month");
  const startDate = monthStart.startOf("week");
  const endDate = monthEnd.endOf("week");

  return {
    monthStart,
    monthEnd,
    startDate,
    endDate,
    currentDate,
  };
};

type Dates = ReturnType<typeof getDates>;

export const MonthlyEventCalendar: React.FC<MonthlyEventCalendarProps> = ({
  date,
  events: propsEvents,
  className,
  disableTimeChange = false,
  schedule = {},
  onEventClick,
  onRangeChange,
  onDateClick,
}) => {
  const t = useI18n("admin");
  const locale = useLocale();
  const timeZone = useTimeZone();

  const [dates, setDates] = React.useState<Dates>(
    getDates(DateTime.fromJSDate(date || new Date()).setZone(timeZone)),
  );

  React.useEffect(() => {
    setDates(
      getDates(DateTime.fromJSDate(date || new Date()).setZone(timeZone)),
    );
  }, [date]);

  React.useEffect(() => {
    onRangeChange?.(dates.startDate.toJSDate(), dates.endDate.toJSDate());
  }, [dates]);

  const previous = React.useCallback(() => {
    setDates(getDates(dates.monthStart.minus({ months: 1 })));
  }, [dates, getDates]);

  const next = React.useCallback(() => {
    setDates(getDates(dates.monthStart.plus({ months: 1 })));
  }, [dates, getDates]);

  const rows = [];
  let days = [];
  let day = dates.startDate;

  while (day <= dates.endDate) {
    for (let i = 0; i < 7; i++) {
      const dayClonned = day.plus({});
      const formattedDate = dayClonned.toFormat("d");

      // Get events for this day
      const dayEvents = (propsEvents || []).filter((event) =>
        hasSame(DateTime.fromJSDate(event.start), dayClonned, "day"),
      );

      const isToday = hasSame(dayClonned, DateTime.now(), "day");
      const daySchedule = schedule[dayClonned.toISODate()!];

      days.push(
        <div
          key={dayClonned.toString()}
          className={cn(
            "h-32 cursor-pointer border p-1 transition-colors hover:bg-accent/40 relative",
            !hasSame(dayClonned, dates.monthStart, "month") &&
              "bg-muted text-muted-foreground",
            isToday && "bg-accent/20",
          )}
          onClick={() => onDateClick?.(dayClonned.toJSDate())}
        >
          <div className="flex justify-between">
            <span
              className={cn(
                "text-sm font-medium px-1",
                isToday && "bg-primary text-primary-foreground",
              )}
            >
              {formattedDate}
            </span>
            {daySchedule?.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs bg-accent text-accent-foreground px-1 md:px-2 py-0.5 rounded flex items-center">
                    <Clock className="h-3 w-3 md:mr-1" />
                    <span className="hidden md:inline">
                      {t("calendar.work")}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-transparent">
                  <div className="bg-accent text-accent-foreground p-3 rounded-md">
                    <div className="text-sm font-medium flex items-center text-accent-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{t("calendar.workingHours")}</span>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      {daySchedule.map((hours, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-accent-foreground/80"
                        >
                          {formatTimeLocale(parseTime(hours.start), locale)} -{" "}
                          {formatTimeLocale(parseTime(hours.end), locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="mt-2 space-y-1 overflow-y-auto max-h-24">
            {dayEvents.map((event, idx) => (
              <EventPopover key={idx} event={event}>
                <div
                  key={idx}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer text-primary-foreground",
                    EventVariantClasses[event.variant || "primary"] ??
                      EventVariantClasses.primary,
                  )}
                  onClick={(e) => {
                    onEventClick?.(event);
                    e.stopPropagation();
                  }}
                >
                  {event.title}
                </div>
              </EventPopover>
            ))}
            {/* {dayEvents.length > 3 && (
              <div className="text-xs text-muted-foreground px-1">
                +{dayEvents.length - 3} more
              </div>
            )} */}
          </div>
        </div>,
      );
      day = day.plus({ days: 1 });
    }
    rows.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {days}
      </div>,
    );
    days = [];
  }

  return (
    <div className={cn("my-3 max-w-full", className)}>
      <div
        className={cn(
          "flex flex-row items-center pb-2 bg-background sticky z-[5] top-0 h-12",
          disableTimeChange ? "justify-center" : "justify-between",
        )}
      >
        {!disableTimeChange && (
          <Button variant="outline" onClick={previous}>
            <ChevronLeft />
          </Button>
        )}
        <div>
          {dates.currentDate.toLocaleString(
            { month: "long", year: "numeric" },
            { locale },
          )}
        </div>
        {!disableTimeChange && (
          <Button variant="outline" onClick={next}>
            <ChevronRight />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-7 mb-2">
        {[
          t("calendar.mon"),
          t("calendar.tue"),
          t("calendar.wed"),
          t("calendar.thu"),
          t("calendar.fri"),
          t("calendar.sat"),
          t("calendar.sun"),
        ].map((day) => (
          <div key={day} className="text-sm font-medium text-center py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-1">{rows}</div>
    </div>
  );
};
