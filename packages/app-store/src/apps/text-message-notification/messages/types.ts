import { Language } from "@timelish/i18n";

export type TextMessageNotificationMessage = {
  newAppointmentRequested: string;
  unknownAppointment: string;
  unknownOption: string;
  appointmentConfirmed: string;
  appointmentDeclined: string;
};

export type TextMessageNotificationMessages = {
  [key in Language]: TextMessageNotificationMessage;
};
