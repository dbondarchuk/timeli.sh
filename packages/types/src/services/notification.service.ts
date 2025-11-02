import { AllKeys, I18nNamespaces } from "@vivid/i18n";
import { Email } from "../apps/mail";
import { DashboardNotification } from "../apps/notifications/dashboard";
import { TextMessageData } from "../apps/text-message";
import { TextMessageResponse } from "../apps/text-message/text-message-sender";
import { CommunicationParticipantType } from "../communication";

export type EmailNotificationRequest<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
  email: Email;
  handledBy:
    | AllKeys<T, CustomKeys>
    | {
        key: AllKeys<T, CustomKeys>;
        args: Record<string, string>;
      };
  participantType: CommunicationParticipantType;
  appointmentId?: string;
  customerId?: string;
};

export type TextMessageNotificationRequest<
  T extends I18nNamespaces = I18nNamespaces,
  CustomKeys extends string | undefined = undefined,
> = {
  phone: string;
  body: string;
  sender?: string;
  handledBy:
    | AllKeys<T, CustomKeys>
    | {
        key: AllKeys<T, CustomKeys>;
        args: Record<string, string>;
      };
  participantType: CommunicationParticipantType;
  webhookData?: TextMessageData;
  appointmentId?: string;
  customerId?: string;
};

export interface INotificationService {
  sendEmail(props: EmailNotificationRequest): Promise<void>;

  sendTextMessage(
    props: TextMessageNotificationRequest,
  ): Promise<TextMessageResponse>;
}

export interface IDashboardNotificationsService {
  publishNotification(notification: DashboardNotification): Promise<void>;
}
