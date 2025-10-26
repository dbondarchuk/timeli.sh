import { Appointment } from "@vivid/types";
import { DateTime } from "luxon";
import { ScheduledNotification } from "./models";

export const calculateScheduledNotificationTime = (
  scheduledNotification: ScheduledNotification,
  appointment: Appointment,
) => {
  const dateTime = DateTime.fromJSDate(appointment.dateTime).setZone(
    appointment.timeZone,
  );

  switch (scheduledNotification.type) {
    case "timeBefore":
      return dateTime.minus({
        weeks: scheduledNotification.weeks ?? 0,
        days: scheduledNotification.days ?? 0,
        hours: scheduledNotification.hours ?? 0,
        minutes: scheduledNotification.minutes ?? 0,
      });
    case "timeAfter":
      return dateTime.plus({
        weeks: scheduledNotification.weeks ?? 0,
        days: scheduledNotification.days ?? 0,
        hours: scheduledNotification.hours ?? 0,
        minutes: scheduledNotification.minutes ?? 0,
      });
    case "atTimeBefore":
      return dateTime
        .minus({
          weeks: scheduledNotification.weeks ?? 0,
          days: scheduledNotification.days ?? 0,
        })
        .set({
          hour: scheduledNotification.time.hour ?? 0,
          minute: scheduledNotification.time.minute ?? 0,
        });
    case "atTimeAfter":
      return dateTime
        .plus({
          weeks: scheduledNotification.weeks ?? 0,
          days: scheduledNotification.days ?? 0,
        })
        .set({
          hour: scheduledNotification.time.hour ?? 0,
          minute: scheduledNotification.time.minute ?? 0,
        });
    default:
      throw new Error(
        `Unsupported scheduled notification type: ${(scheduledNotification as any).type}`,
      );
  }
};

export const compareAppointmentCount = (
  scheduledNotification: ScheduledNotification,
  appointmentCount: number,
) => {
  if (
    scheduledNotification.appointmentCount &&
    scheduledNotification.appointmentCount.type !== "none" &&
    scheduledNotification.appointmentCount.count
  ) {
    switch (scheduledNotification.appointmentCount.type) {
      case "lessThan":
        return appointmentCount < scheduledNotification.appointmentCount.count;
      case "equalTo":
        return (
          appointmentCount === scheduledNotification.appointmentCount.count
        );
      case "greaterThan":
        return appointmentCount > scheduledNotification.appointmentCount.count;
      case "lessThanOrEqualTo":
        return appointmentCount <= scheduledNotification.appointmentCount.count;
      case "greaterThanOrEqualTo":
        return appointmentCount >= scheduledNotification.appointmentCount.count;
    }
  }
  return true;
};
