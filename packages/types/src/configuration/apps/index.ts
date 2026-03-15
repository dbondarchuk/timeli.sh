import * as z from "zod";
import { zObjectId } from "../../utils";

export const defaultAppsConfigurationSchema = z.object({
  paymentAppId: zObjectId().optional(),
  emailSenderAppId: zObjectId().optional(),
  textMessageSenderAppId: zObjectId().optional(),
  textMessageResponderAppId: zObjectId().optional(),
});

export type DefaultAppsConfiguration = z.infer<
  typeof defaultAppsConfigurationSchema
>;
