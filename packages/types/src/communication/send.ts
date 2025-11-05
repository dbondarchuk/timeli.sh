import * as z from "zod";
import { zNonEmptyString } from "../utils";
import {
  emailCommunicationChannel,
  textMessageCommunicationChannel,
} from "./communication";

export const baseSendCommunicationRequestSchema = z.object({
  //   templateId: z.string().min(1, "Template ID is required"),
});

export const sendAppointmentCommunicationRequestSchema = z.object({
  appointmentId: zNonEmptyString("communication.appointment.required"),
});

export const sendCustomerCommunicationRequestSchema = z.object({
  customerId: zNonEmptyString("communication.customer.required"),
  ...baseSendCommunicationRequestSchema.shape,
});

export const sendTextMessageCommunicationRequestSchema = z.object({
  channel: z.literal(textMessageCommunicationChannel),
  content: zNonEmptyString("communication.message.required"),
});

export const sendEmailCommunicationRequestSchema = z.object({
  channel: z.literal(emailCommunicationChannel),
  subject: zNonEmptyString("communication.email.subject.required"),
  content: z.looseObject(
    {
      type: zNonEmptyString("communication.email.content.required"),
      data: z.custom<Required<any>>((d) => d !== undefined),
      id: zNonEmptyString("communication.email.content.required"),
    },
    {
      error: "communication.email.content.required",
    },
  ),
});

export const sendCommunicationRequestSchema = z
  .intersection(
    z.discriminatedUnion("channel", [
      sendTextMessageCommunicationRequestSchema,
      sendEmailCommunicationRequestSchema,
    ]),
    z.union([
      sendAppointmentCommunicationRequestSchema,
      sendCustomerCommunicationRequestSchema,
    ]),
  )
  .superRefine((arg, ctx) => {
    if (!("appointmentId" in arg) && !("customerId" in arg)) {
      ctx.addIssue({
        path: ["customerId", "appointmentId"],
        code: "custom",
        message: "communication.appointmentOrCustomer.required",
      });
    } else if ("appointmentId" in arg && "customerId" in arg) {
      ctx.addIssue({
        path: ["customerId", "appointmentId"],
        code: "custom",
        message: "communication.appointmentOrCustomer.onlyOne",
      });
    }
  });
// type a = z.infer<typeof s>;
// type b = z.infer<typeof sendTextMessageCommunicationRequestSchema>;

// export const sendCommunicationRequestSchema = z
//   .discriminatedUnion("channel", [
//     sendTextMessageCommunicationRequestSchema,
//     sendEmailCommunicationRequestSchema,
//   ])
//   .superRefine((arg, ctx) => {
//     if (!arg.appointmentId && !arg.customerId) {
//       ctx.addIssue({
//         path: ["customerId", "appointmentId"],
//         code: "custom",
//         message: "Either customerId or appointmentId is required",
//       });
//     } else if (arg.appointmentId && arg.customerId) {
//       ctx.addIssue({
//         path: ["customerId", "appointmentId"],
//         code: "custom",
//         message: "Only one of customerId or appointmentId should be present",
//       });
//     }
//   });

export type SendCommunicationRequest = z.infer<
  typeof sendCommunicationRequestSchema
>;
