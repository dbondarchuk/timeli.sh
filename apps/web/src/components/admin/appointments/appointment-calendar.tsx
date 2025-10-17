"use client";

import { useI18n } from "@vivid/i18n";
import { Appointment, DaySchedule, Event } from "@vivid/types";
import { cn, useTimeZone } from "@vivid/ui";
import { DateTime, HourNumbers } from "luxon";
import React from "react";
import {
  CalendarEvent,
  WeeklyEventCalendar,
  WeeklyEventCalendarProps,
} from "../event-calendar";

export const AppointmentCalendar: React.FC<
  Pick<WeeklyEventCalendarProps, "className"> & {
    appointment: Appointment;
    onEventsLoad?: (events: Event[]) => void;
  }
> = ({ appointment, onEventsLoad, ...props }) => {
  const t = useI18n("admin");
  const [apiEvents, setApiEvents] = React.useState<Event[]>([]);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [schedule, setSchedule] = React.useState<Record<string, DaySchedule>>(
    {},
  );
  const [loading, setLoading] = React.useState(false);

  const timeZone = useTimeZone();

  const appointmentDateTime = appointment.dateTime;
  const appointmentDate = React.useMemo(
    () => DateTime.fromJSDate(appointment.dateTime).toISODate(),
    [appointmentDateTime],
  );

  const getData = async (start: DateTime, end: DateTime) => {
    setLoading(true);
    const response = await fetch(
      `/admin/api/calendar?start=${encodeURIComponent(start.toISO()!)}&end=${encodeURIComponent(end.toISO()!)}`,
    );

    const body = (await response.json()) as {
      events: Event[];
      schedule: Record<string, DaySchedule>;
    };

    const apiEvents = (body.events || []).map((a) => ({
      ...a,
      dateTime: DateTime.fromISO(a.dateTime as unknown as string)
        .setZone(timeZone)
        .toJSDate(),
    }));

    setLoading(false);
    setApiEvents(apiEvents);
    setSchedule(body.schedule);
  };

  React.useEffect(() => {
    const apiEventsWithoutCurrent = apiEvents.filter(
      (a) => (a as Appointment)._id !== appointment._id,
    );

    setEvents([...apiEventsWithoutCurrent, appointment]);

    onEventsLoad?.(apiEvents);
  }, [apiEvents, appointment, onEventsLoad, setEvents]);

  React.useEffect(() => {
    const date = DateTime.fromJSDate(appointmentDateTime);
    getData(
      date.minus({ days: 1 }).startOf("day"),
      date.plus({ days: 1 }).endOf("day"),
    );
  }, [appointmentDate]);

  const calendarEvents: CalendarEvent[] = React.useMemo(
    () =>
      events.map((app) => {
        const start = DateTime.fromJSDate(app.dateTime);
        if ("_id" in app) {
          return {
            start: start.toJSDate(),
            end: start.plus({ minutes: app.totalDuration || 0 }).toJSDate(),
            id: app._id,
            title: t("appointments.calendar.eventTitle", {
              customer: app.fields.name,
              service: app.option.name,
            }),
            variant:
              app._id === appointment._id
                ? app.status === "declined"
                  ? "destructive"
                  : "primary"
                : app.status === "confirmed"
                  ? "tertiary"
                  : "secondary",
          };
        } else {
          return {
            start: start.toJSDate(),
            end: start.plus({ minutes: app.totalDuration || 0 }).toJSDate(),
            title: app.title,
            variant: "tertiary",
          };
        }
      }),
    [events, t, appointment._id],
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute bg-white bg-opacity-60 z-50 h-full w-full flex items-center justify-center">
          <div className="flex items-center">
            <span className="text-3xl mr-4">
              {t("appointments.calendar.loading")}
            </span>
            <svg
              className="animate-spin h-8 w-8 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}
      <WeeklyEventCalendar
        className={cn("min-w-[200px] h-[60vh] pt-0", props.className)}
        date={appointment.dateTime}
        events={calendarEvents}
        schedule={schedule}
        variant="days-around"
        daysAround={1}
        scrollToHour={
          Math.max(appointment.dateTime.getHours() - 2, 0) as HourNumbers
        }
        disableTimeChange
      />
    </div>
  );
};
