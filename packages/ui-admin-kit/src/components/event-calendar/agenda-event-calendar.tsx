import { useI18n, useLocale } from "@vivid/i18n";
import { Button, cn, ScrollArea, useTimeZone } from "@vivid/ui";
import { formatTimeLocale, hasSame, parseTime } from "@vivid/utils";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { EventPopover } from "./event-popover";
import { EventVariantClasses } from "./styles";
import { AgendaEventCalendarProps, CalendarEvent } from "./types";

type EventsByDate = {
  date: DateTime;
  events: CalendarEvent[];
};

export const AgendaEventCalendar: React.FC<AgendaEventCalendarProps> = ({
  date,
  events: propsEvents,
  className,
  disableTimeChange = false,
  daysToShow = 3,
  schedule = {},
  onEventClick,
  onRangeChange,
  renderEvent,
}) => {
  const t = useI18n("admin");
  const locale = useLocale();
  const timeZone = useTimeZone();

  const [currentDate, setCurrentDate] = React.useState<DateTime>(
    DateTime.fromJSDate(date || new Date()),
  );

  React.useEffect(() => {
    setCurrentDate(DateTime.fromJSDate(date || new Date()));
  }, [date]);

  React.useEffect(() => {
    onRangeChange?.(
      currentDate.toJSDate(),
      currentDate.plus({ days: 1 }).endOf("day").toJSDate(),
    );
  }, [currentDate]);

  const previous = React.useCallback(() => {
    setCurrentDate(currentDate.minus({ days: daysToShow }).startOf("day"));
  }, [currentDate]);

  const next = React.useCallback(() => {
    setCurrentDate(currentDate.plus({ days: daysToShow }).startOf("day"));
  }, [currentDate]);

  const [expandedDates, setExpandedDates] = React.useState<
    Record<string, boolean>
  >({});

  // Group events by date
  const getEventsByDate = (): EventsByDate[] => {
    const eventsByDate: EventsByDate[] = [];
    const dateMap = new Map<string, CalendarEvent[]>();

    // Create a range of dates to show
    const dateRange: DateTime[] = [];
    for (let i = 0; i < daysToShow; i++) {
      dateRange.push(currentDate.plus({ days: i }));
    }

    // Initialize all dates in range with empty arrays
    dateRange.forEach((date) => {
      const dateKey = date.toFormat("yyyy-MM-dd");
      dateMap.set(dateKey, []);
    });

    // Add events to their respective dates
    propsEvents?.forEach((event) => {
      const eventDate = new Date(event.start);
      const dateKey = DateTime.fromJSDate(eventDate).toFormat("yyyy-MM-dd");

      if (dateMap.has(dateKey)) {
        dateMap.get(dateKey)?.push(event);
      }
    });

    // Convert map to array and sort events within each date
    dateRange.forEach((date) => {
      const dateKey = date.toFormat("yyyy-MM-dd");
      const dateEvents = dateMap.get(dateKey) || [];

      // Sort events by start time
      dateEvents.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

      eventsByDate.push({
        date,
        events: dateEvents,
      });
    });

    return eventsByDate;
  };

  const eventsByDate = getEventsByDate();

  // Toggle date expansion
  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // Check if a date should be expanded
  const isDateExpanded = (date: DateTime): boolean => {
    const dateKey = date.toFormat("yyyy-MM-dd");

    // If not explicitly set, default to expanded for today and dates with events
    if (expandedDates[dateKey] === undefined) {
      const hasEvents =
        (eventsByDate.find((item) => hasSame(item.date, date, "day"))?.events
          .length ?? 0) > 0;

      return hasSame(date, DateTime.now(), "day") || hasEvents;
    }

    return expandedDates[dateKey];
  };

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
          {currentDate.toLocaleString(DateTime.DATE_MED, { locale })} -{" "}
          {currentDate
            .plus({ day: daysToShow - 1 })
            .toLocaleString(DateTime.DATE_MED, { locale })}
        </div>
        {!disableTimeChange && (
          <Button variant="outline" onClick={next}>
            <ChevronRight />
          </Button>
        )}
      </div>
      <ScrollArea className="py-3 max-w-full">
        {/* <div className="p-4 overflow-y-auto max-h-[700px]"> */}
        <div className="space-y-1">
          {eventsByDate.map(({ date, events }) => {
            const dateKey = date.toISODate()!;
            const expanded = isDateExpanded(date);
            const hasEvents = events.length > 0;

            const daySchedule = schedule[dateKey];

            return (
              <div key={dateKey} className="mb-4">
                <div
                  className={cn(
                    "flex items-center py-2 px-3 rounded-md cursor-pointer",
                    hasSame(date, DateTime.now(), "day")
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted",
                    hasEvents ? "font-medium" : "text-muted-foreground",
                  )}
                  onClick={() => toggleDateExpansion(dateKey)}
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span
                    className={cn(
                      hasSame(date, DateTime.now(), "day") && "font-bold",
                    )}
                  >
                    {date.toLocaleString(DateTime.DATE_FULL, { locale })}
                    {hasSame(date, DateTime.now(), "day") &&
                      ` (${t("calendar.today")})`}
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    {daySchedule?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{t("calendar.workingDay")}</span>
                      </span>
                    )}
                    {hasEvents && (
                      <span className="text-xs text-muted-foreground">
                        {events.length}{" "}
                        {events.length === 1
                          ? t("calendar.event")
                          : t("calendar.events")}
                      </span>
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="pl-10 pr-4 mt-2 space-y-2">
                    {daySchedule?.length > 0 && (
                      <div className="mb-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
                        <div className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-300">
                          <Clock className="h-4 w-4 mr-2" />
                          {t("calendar.workingHours")}
                        </div>
                        <div className="mt-1 flex flex-row gap-2 flex-wrap">
                          {daySchedule.map((hours, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-blue-600 dark:text-blue-400"
                            >
                              {formatTimeLocale(parseTime(hours.start), locale)}{" "}
                              - {formatTimeLocale(parseTime(hours.end), locale)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {events.length === 0 ? (
                      <div className="text-muted-foreground text-sm py-2">
                        {t("calendar.noEventsScheduled")}
                      </div>
                    ) : (
                      events.map((event, idx) => {
                        const eventDate = DateTime.fromJSDate(
                          event.start,
                        ).setZone(timeZone);
                        const endDate = DateTime.fromJSDate(event.end).setZone(
                          timeZone,
                        );

                        return (
                          <EventPopover key={idx} event={event}>
                            <div
                              className="flex items-start space-x-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                              onClick={(e) => {
                                onEventClick?.(event);
                                e.stopPropagation();
                              }}
                            >
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full mt-1.5",
                                  EventVariantClasses[
                                    event.variant || "primary"
                                  ] ?? EventVariantClasses.primary,
                                )}
                              />
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between">
                                  <div className="font-medium">
                                    {event.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {eventDate.toLocaleString(
                                      DateTime.TIME_SIMPLE,
                                      { locale },
                                    )}{" "}
                                    -{" "}
                                    {endDate.toLocaleString(
                                      DateTime.TIME_SIMPLE,
                                      { locale },
                                    )}
                                  </div>
                                </div>
                                {renderEvent && renderEvent(event)}
                              </div>
                            </div>
                          </EventPopover>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {eventsByDate.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            {t("calendar.noEventsInRange")}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedDates({})}
          >
            {t("calendar.collapseAll")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              eventsByDate.forEach(({ date }) => {
                const dateKey = date.toFormat("yyyy-MM-dd");
                allExpanded[dateKey] = true;
              });
              setExpandedDates(allExpanded);
            }}
          >
            {t("calendar.expandAll")}
          </Button>
        </div>
      </ScrollArea>
      {/* </div> */}
    </div>
  );
};
