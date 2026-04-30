import type { EventEnvelope, EventSource } from "@timelish/types";
import {
  APPOINTMENT_CREATED_EVENT_TYPE,
  APPOINTMENT_RESCHEDULED_EVENT_TYPE,
  APPOINTMENT_SLOT_RESCHEDULED_EVENT_TYPE,
  APPOINTMENT_STATUS_CHANGED_EVENT_TYPE,
  type Appointment,
  type AppointmentCreatedPayload,
  type AppointmentRescheduledPayload,
  type AppointmentSlotRescheduledPayload,
  type AppointmentStatusChangedPayload,
  type AppointmentStatus,
} from "@timelish/types";

/**
 * Maps core `appointment.*` envelopes to legacy hook-style callbacks used by notification/calendar apps.
 */
export type AppointmentEventDispatchHandlers = {
  onAppointmentCreated?: (
    appointment: Appointment,
    confirmed: boolean,
    source: EventSource,
  ) => Promise<void>;
  onAppointmentFullRescheduled?: (
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    oldTime: Date | undefined,
    oldDuration: number | undefined,
    doNotNotifyCustomer: boolean | undefined,
    source: EventSource,
  ) => Promise<void>;
  onAppointmentSlotRescheduled?: (
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    oldTime: Date | undefined,
    oldDuration: number | undefined,
    doNotNotifyCustomer: boolean | undefined,
    source: EventSource,
  ) => Promise<void>;
  onAppointmentStatusChanged?: (
    appointment: Appointment,
    newStatus: AppointmentStatus,
    oldStatus: AppointmentStatus | undefined,
    source: EventSource,
  ) => Promise<void>;
};

/** Returns true if the envelope was an appointment event and a handler ran. */
export async function dispatchAppointmentEventPayload(
  envelope: EventEnvelope,
  handlers: AppointmentEventDispatchHandlers,
): Promise<boolean> {
  switch (envelope.type) {
    case APPOINTMENT_CREATED_EVENT_TYPE: {
      if (!handlers.onAppointmentCreated) {
        return false;
      }
      const p = envelope.payload as AppointmentCreatedPayload;
      await handlers.onAppointmentCreated(
        p.appointment,
        p.confirmed,
        envelope.source,
      );
      return true;
    }
    case APPOINTMENT_RESCHEDULED_EVENT_TYPE: {
      if (!handlers.onAppointmentFullRescheduled) {
        return false;
      }
      const p = envelope.payload as AppointmentRescheduledPayload;
      await handlers.onAppointmentFullRescheduled(
        p.updatedAppointment,
        p.dateTime,
        p.totalDuration,
        p.previousDateTime,
        p.previousTotalDuration,
        p.doNotNotifyCustomer,
        envelope.source,
      );
      return true;
    }
    case APPOINTMENT_SLOT_RESCHEDULED_EVENT_TYPE: {
      if (!handlers.onAppointmentSlotRescheduled) {
        return false;
      }
      const p = envelope.payload as AppointmentSlotRescheduledPayload;
      await handlers.onAppointmentSlotRescheduled(
        p.appointment,
        p.newTime,
        p.newDuration,
        p.oldTime,
        p.oldDuration,
        p.doNotNotifyCustomer,
        envelope.source,
      );
      return true;
    }
    case APPOINTMENT_STATUS_CHANGED_EVENT_TYPE: {
      if (!handlers.onAppointmentStatusChanged) {
        return false;
      }
      const p = envelope.payload as AppointmentStatusChangedPayload;
      await handlers.onAppointmentStatusChanged(
        p.appointment,
        p.newStatus,
        p.oldStatus,
        envelope.source,
      );
      return true;
    }
    default:
      return false;
  }
}
