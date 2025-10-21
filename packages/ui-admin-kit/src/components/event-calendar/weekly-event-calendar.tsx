"use client";

import { useI18n, useLocale } from "@vivid/i18n";
import { DaySchedule, Shift } from "@vivid/types";
import {
  Button,
  cn,
  ScrollArea,
  ScrollBar,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useMouse,
  useTimeZone,
} from "@vivid/ui";
import { formatTime, formatTimeLocale, parseTime } from "@vivid/utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { DateTime, HourNumbers, SecondNumbers } from "luxon";
import React, { CSSProperties, Fragment, useCallback } from "react";
import { EventPopover } from "./event-popover";
import { EventVariantClasses } from "./styles";
import { CalendarEvent, WeeklyEventCalendarProps } from "./types";

const colStartClass = "col-start-[var(--calendar-col-start)]";
const colSpanClass = "col-end-[var(--calendar-col-end)]";
const rowStartClass = "row-start-[var(--calendar-row-start)]";
const rowSpanClass = "row-end-[var(--calendar-row-end)]";
const colsRepeatClass = "grid-cols-[var(--calendar-grid-cols)]";

const ShiftDisplay: React.FC<{
  schedule: DaySchedule;
  className: string;
  style: CSSProperties;
}> = ({ schedule, className, style }) => {
  const t = useI18n("admin");
  const locale = useLocale();
  const { ref, x, y } = useMouse<HTMLDivElement>();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={className} style={style} ref={ref} />
      </TooltipTrigger>
      <TooltipContent
        className="bg-transparent"
        align="start"
        alignOffset={x}
        sideOffset={-y + 10}
        hideWhenDetached
      >
        <div className="bg-accent p-3 rounded-md">
          <div className="text-sm font-medium flex items-center text-accent-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{t("calendar.workingHours")}</span>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            {schedule.map((hours, idx) => (
              <div key={idx} className="text-sm text-accent-foreground/80">
                {formatTimeLocale(parseTime(hours.start), locale)} -{" "}
                {formatTimeLocale(parseTime(hours.end), locale)}
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export const WeeklyEventCalendar: React.FC<WeeklyEventCalendarProps> = ({
  date,
  variant = "week-of",
  events: propsEvents,
  className,
  scrollToHour = 8,
  disableTimeChange = false,
  slotInterval = 10,
  schedule = {},
  onEventClick,
  onRangeChange,
  ...rest
}) => {
  const timeZone = useTimeZone();

  const timeSlotColCount = 1;
  const slotsPerHour = 60 / slotInterval;
  const locale = useLocale();
  const daysAround = ("daysAround" in rest ? rest.daysAround : undefined) ?? 3;

  const timeSlots = Array.from({ length: 24 }).flatMap((_, hour) =>
    Array.from({ length: slotsPerHour }).map((_, index) =>
      formatTime({
        hour: hour as HourNumbers,
        minute: (index * slotInterval) as SecondNumbers,
      }),
    ),
  );

  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const offset = scrollRef?.current?.offsetTop;

    scrollAreaRef?.current?.scrollTo({
      top: offset,
      behavior: "instant",
    });
  }, [scrollRef]);

  const getDates = (day: Date) => {
    switch (variant) {
      case "days-around":
        return Array.from({ length: daysAround * 2 + 1 })
          .map((_, index) => -1 * daysAround + index)
          .map((d) =>
            DateTime.fromJSDate(day).startOf("day").plus({ days: d }),
          );

      case "week-of":
      default:
        return [0, 1, 2, 3, 4, 5, 6].map((d) =>
          DateTime.fromJSDate(day).startOf("week").plus({ days: d }),
        );
    }
  };

  const [dates, setDates] = React.useState<DateTime[]>(
    getDates(date || new Date()),
  );

  React.useEffect(() => {
    setDates(getDates(date || new Date()));
  }, [date]);

  React.useEffect(() => {
    onRangeChange?.(dates[0].toJSDate(), dates[dates.length - 1].toJSDate());
  }, [dates]);

  const previous = React.useCallback(() => {
    let prevDate: DateTime;
    switch (variant) {
      case "days-around":
        prevDate = dates[0].minus({ days: daysAround + 1 });
        break;

      case "week-of":
      default:
        prevDate = dates[0].minus({ weeks: 1 });
        break;
    }

    setDates(getDates(prevDate.toJSDate()));
  }, [dates, getDates]);

  const next = React.useCallback(() => {
    let nextDate: DateTime;
    switch (variant) {
      case "days-around":
        nextDate = dates[0].plus({ days: daysAround + 1 });
        break;

      case "week-of":
      default:
        nextDate = dates[0].plus({ weeks: 1 });
        break;
    }

    setDates(getDates(nextDate.toJSDate()));
  }, [dates, getDates]);

  const events = (propsEvents || []).map((event) => {
    const start = DateTime.fromJSDate(event.start).setZone(timeZone);
    const end = DateTime.fromJSDate(event.end).setZone(timeZone);
    return {
      ...event,
      start,
      end,
      isMultiDay: end.diff(start, "hours").hours >= 24,
    };
  });

  const eventToCalendarEvent = (event: (typeof events)[0]): CalendarEvent => ({
    ...event,
    start: event.start.toJSDate(),
    end: event.end.toJSDate(),
  });

  const getEventClassNames = useCallback(
    (event: (typeof events)[number]) => {
      const previousMultiDayEvents = events.filter(
        ({ isMultiDay }, index) => isMultiDay && index < events.indexOf(event),
      );
      const previousNonMultiDayEvents = events.filter(
        ({ isMultiDay }, index) => !isMultiDay && index < events.indexOf(event),
      );
      const isOverlappingNonMultiDay =
        !event.isMultiDay &&
        previousNonMultiDayEvents.reduce(
          (isEventOverlappingPreviousEvents, otherAppointment) => {
            return (
              isEventOverlappingPreviousEvents ||
              (event.start < otherAppointment.end &&
                event.end > otherAppointment.start)
            );
          },
          false,
        );

      // Disallow negative index (if date outside of range, the
      // event should start at the first date in props.dates)
      const dateIndex = Math.max(
        0,
        dates.findIndex((date) =>
          date
            .toFormat("YYYY-MM-DD")
            .startsWith(event.start.toFormat("YYYY-MM-DD")),
        ),
      );

      const styles = {
        "--calendar-col-start": `${timeSlotColCount + dateIndex + 1}`,
        "--calendar-col-end": `span ${Math.floor(
          Math.min(
            dates.length - dateIndex,
            event.end.diff(
              event.start > dates[0] ? event.start : dates[0],
              "days",
            ).days,
          ),
        )}`,
        "--calendar-row-start": `${
          (event.isMultiDay
            ? previousMultiDayEvents.reduce((rowStart, multiDayEvent) => {
                // Move the event down a row if it overlaps with a previous event
                if (
                  event.start < multiDayEvent.end &&
                  event.end > multiDayEvent.start
                ) {
                  rowStart++;
                }
                return rowStart;
              }, 1)
            : timeSlots.indexOf(
                event.start
                  .set({
                    minute:
                      event.start.minute - (event.start.minute % slotInterval),
                  })
                  .toFormat("HH:mm") as (typeof timeSlots)[number],
              )) + 1
        }`,
        "--calendar-row-end": `span ${Math.floor(
          event.end.diff(event.start, "minutes").minutes / slotInterval,
        )}`,
      };

      const classes = cn(
        "flex max-h-full flex-col break-words rounded p-[7px_6px_5px] text-[13px] leading-[20px] no-underline transition-[background-color] z-[2] hover:z-[4] hover:h-min hover:max-h-none hover:min-h-full cursor-pointer",
        colStartClass,
        event.isMultiDay && colSpanClass,
        rowStartClass,
        !event.isMultiDay && rowSpanClass,
        EventVariantClasses[event.variant || "primary"] ||
          EventVariantClasses.primary,
        isOverlappingNonMultiDay &&
          "w-[75%] ml-[25%] border border-white text-right z-[3] hover:z-[4]",
      );

      return {
        styles,
        classes,
      };
    },
    [dates, events, timeSlotColCount],
  );

  const getShiftClassNames = useCallback(
    (date: string, shift: Shift) => {
      // Disallow negative index (if date outside of range, the
      // event should start at the first date in props.dates)
      const dateIndex = Math.max(
        0,
        dates.findIndex((d) => d.toISODate() === date),
      );

      const shiftStart = DateTime.fromFormat(shift.start, "HH:mm");
      const shiftEnd = DateTime.fromFormat(shift.end, "HH:mm");

      const styles = {
        "--calendar-col-start": `${timeSlotColCount + dateIndex + 1}`,
        "--calendar-col-end": `span 1`,
        "--calendar-row-start": `${
          timeSlots.indexOf(
            shiftStart
              .set({
                minute: shiftStart.minute - (shiftStart.minute % slotInterval),
              })
              .toFormat("HH:mm") as (typeof timeSlots)[number],
          ) + 1
        }`,
        "--calendar-row-end": `span ${Math.floor(
          shiftEnd.diff(shiftStart, "minutes").minutes / slotInterval,
        )}`,
      };

      const classes = cn(
        "bg-accent/50 dark:bg-accent/10 flex max-h-full flex-col p-[7px_6px_5px] text-[13px] leading-[20px] no-underline transition-[background-color] z-[1]",
        colStartClass,
        rowStartClass,
        colSpanClass,
        rowSpanClass,
      );

      return {
        styles,
        classes,
      };
    },
    [dates, schedule, timeSlotColCount],
  );

  const sizePerRow = 64 / (timeSlots.length / 24);

  const startDateFormatted = dates[0].toLocaleString(DateTime.DATE_MED, {
    locale,
  });

  const endDateFormatted = dates[dates.length - 1].toLocaleString(
    DateTime.DATE_MED,
    { locale },
  );

  return (
    <ScrollArea
      className={cn("my-3 max-w-full grid", className)}
      viewportRef={scrollAreaRef}
    >
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
          {startDateFormatted === endDateFormatted
            ? startDateFormatted
            : `${startDateFormatted} - ${endDateFormatted}`}
        </div>
        {!disableTimeChange && (
          <Button variant="outline" onClick={next}>
            <ChevronRight />
          </Button>
        )}
      </div>
      <div className="w-full h-full border-x border-b border-secondary">
        <div
          className={cn(
            "px-2 grid grid-rows-1 gap-0 sticky top-12 bg-background z-[5] shadow-md  border-y border-secondary",
            colsRepeatClass,
            //colsRepeatClasses[dates.length as keyof typeof colsRepeatClasses]
          )}
          style={{
            "--calendar-grid-cols": `100px repeat(${dates.length}, minmax(100px, 1fr))`,
          }}
        >
          <div></div>
          {dates.map((date, index) => {
            return (
              <Fragment key={`date-${date.toISO()}`}>
                <div
                  className={cn(
                    "text-darkGray row-start-1 col-span-1 px-2 py-6 text-center text-[13px] text-xs",
                    colStartClass,
                  )}
                  style={{
                    "--calendar-col-start": timeSlotColCount + index + 1,
                  }}
                >
                  {date.toFormat("EEE, MMM dd", { locale })}
                </div>
                <div
                  className={cn(
                    "text-darkGray row-start-1 col-span-1 px-2 py-6 text-center text-[13px] text-xs border-r border-secondary",
                    colStartClass,
                  )}
                  style={{
                    "--calendar-col-start": timeSlotColCount + index,
                  }}
                ></div>
              </Fragment>
            );
          })}
          <div
            className={cn(
              "text-darkGray row-start-1 col-span-1 px-2 py-6 text-center text-[13px] text-xs border-r border-secondary",
              colStartClass,
            )}
            style={{
              "--calendar-col-start": timeSlotColCount + dates.length,
            }}
          ></div>

          {events
            .filter(({ isMultiDay }) => isMultiDay)
            .map((event, index) => {
              const classes = getEventClassNames(event);
              const calendarEvent = eventToCalendarEvent(event);
              const {
                "--calendar-row-end": _,
                "--calendar-row-start": __,
                ...restStyles
              } = classes.styles;
              return (
                <EventPopover event={calendarEvent} key={`event-${index}`}>
                  <div
                    onClick={() => onEventClick?.(calendarEvent)}
                    className={cn(
                      classes.classes,
                      dates[0].startOf("day") > event.start &&
                        "rounded-l-none ",
                      dates[dates.length - 1].plus({ days: 1 }).startOf("day") <
                        event.end && "rounded-r-none ",
                      "mt-0.5",
                    )}
                    style={restStyles}
                  >
                    {event.title}
                  </div>
                </EventPopover>
              );
            })}
        </div>

        <div
          className={cn(
            "mt-8 px-2 grid grid-rows-[var(--rows-repeat)] gap-0",
            colsRepeatClass,
          )}
          style={{
            "--calendar-grid-cols": `100px repeat(${dates.length}, minmax(100px, 1fr))`,
            "--rows-repeat": `repeat(${timeSlots.length},${sizePerRow}px)`,
          }}
        >
          {Array.from({ length: dates.length + 1 }).map((_, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "text-darkGray row-start-1 row-span-full translate-y-[var(--translate-y)] col-span-1 py-6 text-center text-[13px] text-xs border-r border-secondary",
                  colStartClass,
                )}
                style={{
                  "--calendar-col-start": timeSlotColCount + index,
                  //"--translate-y": `-${sizePerRow * 2}px`,
                }}
              ></div>
            );
          })}
          {timeSlots.map((time, index) => {
            const timeObj = parseTime(time);
            return (
              <Fragment key={`time-slot-${time}`}>
                <div
                  className={cn(
                    rowStartClass,
                    "text-darkGray translate-y-[var(--translate-y)] text-xs leading-[30px] col-span-full border-t scroll-m-16",
                    time.endsWith("00")
                      ? "col-start-1 border-secondary"
                      : "col-start-2 border-primary/20",
                  )}
                  style={{
                    "--calendar-row-start": index + 1,
                    //"--translate-y": `-${sizePerRow * 2}px`,
                  }}
                  data-time={time}
                  ref={
                    timeObj.hour === scrollToHour && timeObj.minute === 0
                      ? scrollRef
                      : undefined
                  }
                ></div>
                <div
                  className={cn(
                    rowStartClass,
                    "text-darkGray translate-y-[var(--translate-y)] text-xs leading-[30px] col-start-1",
                  )}
                  style={{
                    "--calendar-row-start": index + 1,
                    "--translate-y": time.endsWith("00")
                      ? // ? "100%"
                        "20px"
                      : "",
                    // : `-${sizePerRow}px`,
                  }}
                  suppressHydrationWarning
                >
                  {!time.endsWith("00") ? (
                    <>&nbsp;</>
                  ) : (
                    DateTime.fromObject({
                      ...timeObj,
                      year: 2000,
                      month: 1,
                      day: 1,
                    }).toLocaleString(DateTime.TIME_SIMPLE, { locale })
                  )}
                </div>
              </Fragment>
            );
          })}

          {Object.entries(schedule).map(([date, shifts]) =>
            shifts.map((shift, index) => {
              const { classes, styles } = getShiftClassNames(date, shift);
              return (
                <ShiftDisplay
                  schedule={shifts}
                  className={classes}
                  style={styles}
                  key={`${date}-${index}`}
                />
              );
            }),
          )}

          {events
            .filter((event) => {
              const hours = event.end.diff(event.start, "hours").hours;
              return hours < 24;
            })
            .map((event, index) => {
              const { classes, styles } = getEventClassNames(event);
              const calendarEvent = eventToCalendarEvent(event);
              return (
                <EventPopover
                  key={`time-slot-event-${index}`}
                  event={calendarEvent}
                >
                  <div
                    data-id={event.id}
                    onClick={() => onEventClick?.(calendarEvent)}
                    className={classes}
                    style={styles}
                  >
                    <div className="min-h-0 overflow-hidden">{event.title}</div>
                    {event.end.diff(event.start, "minutes").minutes / 30 >
                      1 && (
                      <div
                        className="pt-1 text-[10px]"
                        suppressHydrationWarning
                      >
                        {event.start.toLocaleString(DateTime.TIME_SIMPLE, {
                          locale,
                        })}{" "}
                        -{" "}
                        {event.end.toLocaleString(DateTime.TIME_SIMPLE, {
                          locale,
                        })}
                      </div>
                    )}
                  </div>
                </EventPopover>
              );
            })}
        </div>
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
