"use client";

import { adminApi } from "@vivid/api-sdk";
import { useI18n } from "@vivid/i18n";
import { Appointment, DaySchedule, Event } from "@vivid/types";
import { useTimeZone } from "@vivid/ui";
import {
  CheckCircle,
  DollarSign,
  Presentation,
  StickyNote,
} from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import { AppointmentDialog } from "../appointments/appointment-dialog";
import { AgendaEventCalendar } from "./agenda-event-calendar";
import { MonthlyEventCalendar } from "./monthly-event-calendar";
import { CalendarEvent, EventCalendarProps } from "./types";
import { WeeklyEventCalendar } from "./weekly-event-calendar";

export const EventCalendar: React.FC<EventCalendarProps> = (props) => {
  const t = useI18n("admin");
  const [events, setEvents] = React.useState<Event[]>([]);
  const [appointment, setAppointment] = React.useState<
    Appointment | undefined
  >();

  const [schedule, setSchedule] = React.useState<Record<string, DaySchedule>>(
    {},
  );

  const [loading, setLoading] = React.useState(false);
  const timeZone = useTimeZone();

  const getEvents = async (start: Date, end: Date) => {
    setLoading(true);
    setEvents([]);

    const result = await adminApi.calendar.getCalendar({
      start,
      end,
    });

    setLoading(false);

    setSchedule(result.schedule);
    setEvents(result.events || []);
  };

  const calendarEvents: CalendarEvent[] = React.useMemo(
    () =>
      events.map((app) => {
        const start = DateTime.fromJSDate(app.dateTime);
        if ("_id" in app) {
          return {
            start: start.toJSDate(),
            end: start.plus({ minutes: app.totalDuration || 0 }).toJSDate(),
            id: app._id,
            title: t("calendar.eventTitle", {
              customer: app.fields.name,
              service: app.option.name,
            }),
            variant: app.status !== "confirmed" ? "secondary" : "primary",
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
    [events, t],
  );

  const onEventClick = ({ id }: CalendarEvent) => {
    if (!id) {
      return;
    }

    const appointment = events.find(
      (app) => (app as Appointment)._id == id,
    ) as Appointment;
    if (appointment) setAppointment(appointment);
  };

  const onDialogOpenChange = (open: boolean) => {
    if (!open) {
      setAppointment(undefined);
    }
  };

  const renderEventAgenda = React.useCallback(
    (event: CalendarEvent) => {
      if (!event.id) {
        return null;
      }

      const appointment = events.find(
        (app) => (app as Appointment)._id == event.id,
      ) as Appointment;

      return (
        <dl className="divide-y">
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <Presentation size={16} /> {t("calendar.appointment")}:
            </dt>
            <dd className="col-span-2">{appointment.option.name}</dd>
          </div>
          <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
            <dt className="flex self-center items-center gap-1">
              <CheckCircle size={16} /> {t("calendar.status")}:
            </dt>
            <dd className="col-span-2">
              {t(`appointments.status.${appointment.status}`)}
            </dd>
          </div>
          {appointment.totalPrice && (
            <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
              <dt className="flex self-center items-center gap-1">
                <DollarSign size={16} /> {t("calendar.price")}:
              </dt>
              <dd className="col-span-2">${appointment.totalPrice}</dd>
            </div>
          )}
          {appointment.note && (
            <div className="py-1 flex flex-row gap-2 flex-wrap @sm:py-2 @sm:grid @sm:grid-cols-3 @sm:gap-4">
              <dt className="flex self-center items-center gap-1">
                <StickyNote size={16} /> {t("calendar.note")}:
              </dt>
              <dd className="col-span-2">{appointment.note}</dd>
            </div>
          )}
        </dl>
      );
    },
    [events, t],
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute bg-white/60 z-50 h-full w-full flex items-center justify-center">
          <div className="flex items-center">
            <span className="text-3xl mr-4">{t("common.labels.loading")}</span>
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
      {props.type === "weekly" ? (
        <WeeklyEventCalendar
          onRangeChange={getEvents}
          events={calendarEvents}
          onEventClick={onEventClick}
          variant="week-of"
          schedule={schedule}
          {...props}
        />
      ) : props.type === "daily" ? (
        <WeeklyEventCalendar
          variant="days-around"
          daysAround={0}
          onRangeChange={getEvents}
          events={calendarEvents}
          onEventClick={onEventClick}
          schedule={schedule}
          {...props}
        />
      ) : props.type === "days-around" ? (
        <WeeklyEventCalendar
          onRangeChange={getEvents}
          events={calendarEvents}
          variant="days-around"
          onEventClick={onEventClick}
          schedule={schedule}
          {...props}
        />
      ) : props.type === "agenda" ? (
        <AgendaEventCalendar
          onRangeChange={getEvents}
          events={calendarEvents}
          onEventClick={onEventClick}
          renderEvent={renderEventAgenda}
          schedule={schedule}
          {...props}
        />
      ) : (
        <MonthlyEventCalendar
          onRangeChange={getEvents}
          events={calendarEvents}
          onEventClick={onEventClick}
          schedule={schedule}
          {...props}
        />
      )}

      {appointment && (
        <AppointmentDialog
          appointment={appointment}
          open
          onOpenChange={onDialogOpenChange}
        />
      )}
    </div>
  );
};
