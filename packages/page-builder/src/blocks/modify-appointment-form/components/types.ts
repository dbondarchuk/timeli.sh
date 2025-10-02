export type ModifyAppointmentType = "cancel" | "reschedule";

export type ModifyAppointmentFields = (
  | {
      type: "email";
      email: string;
    }
  | {
      type: "phone";
      phone: string;
    }
) & {
  dateTime: Date;
};
