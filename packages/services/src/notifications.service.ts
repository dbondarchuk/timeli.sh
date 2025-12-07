import { getLoggerFactory } from "@timelish/logger";
import {
  Email,
  EmailNotificationRequest,
  EmailResponse,
  ICommunicationLogsService,
  IConfigurationService,
  IConnectedAppsService,
  IMailSender,
  IMailSenderApp,
  INotificationService,
  ISystemNotificationService,
  ITextMessageSender,
  ITextMessageSenderApp,
  TextMessage,
  TextMessageNotificationRequest,
  TextMessageResponse,
} from "@timelish/types";
import { maskify } from "@timelish/utils";
import { convert } from "html-to-text";

export class NotificationService implements INotificationService {
  protected readonly loggerFactory = getLoggerFactory("NotificationService");

  constructor(
    private readonly companyId: string,
    private readonly configurationService: IConfigurationService,
    private readonly connectedAppService: IConnectedAppsService,
    private readonly communicationLogService: ICommunicationLogsService,
    private readonly defaultEmailService: IMailSender,
    private readonly defaultTextMessageSender: ITextMessageSender,
  ) {}

  public async sendEmail({
    email,
    handledBy,
    participantType,
    appointmentId,
    customerId,
  }: EmailNotificationRequest): Promise<void> {
    const logger = this.loggerFactory("sendEmail");
    const defaultAppsConfiguration =
      await this.configurationService.getConfiguration("defaultApps");

    const emailAppId = defaultAppsConfiguration?.emailSender?.appId;

    let sendMail: (email: Email, fromName?: string) => Promise<EmailResponse>;
    let useCustomerEmailApp = false;
    if (participantType === "customer" && emailAppId) {
      logger.debug({ appId: emailAppId }, "Using customer email app");

      const { app, service } =
        await this.connectedAppService.getAppService<IMailSenderApp>(
          emailAppId,
        );

      sendMail = async (email: Email) => await service.sendMail(app, email);
      useCustomerEmailApp = true;
    } else {
      let fromName: string | undefined = undefined;
      if (participantType === "customer") {
        const generalConfiguration =
          await this.configurationService.getConfiguration("general");
        fromName = generalConfiguration?.name;
      }

      sendMail = async (email: Email) =>
        await this.defaultEmailService.sendMail(email, fromName);
    }

    logger.info(
      {
        emailAppId,
        useCustomerEmailApp,
        emailTo: (Array.isArray(email.to) ? email.to : [email.to])
          .map((to) => maskify(to))
          .join("; "),
        emailSubject: email.subject,
        appointmentId,
        customerId,
      },
      "Sending email",
    );

    try {
      const response = await sendMail(email);

      logger.info({ response }, "Successfully sent email");

      this.communicationLogService.log({
        direction: "outbound",
        channel: "email",
        handledBy,
        participantType,
        participant: Array.isArray(email.to) ? email.to.join("; ") : email.to,
        text: convert(email.body, { wordwrap: 130 }),
        html: email.body,
        subject: email.subject,
        appointmentId,
        customerId,
        data: response,
      });
    } catch (error) {
      logger.error({ error }, "Error sending email");
      throw error;
    }
  }

  public async sendTextMessage({
    phone,
    body,
    sender,
    handledBy,
    participantType,
    webhookData,
    appointmentId,
    customerId,
  }: TextMessageNotificationRequest): Promise<TextMessageResponse> {
    const trimmedPhone = phone.replaceAll(/[^+0-9]/gi, "");
    const logger = this.loggerFactory("sendTextMessage");

    logger.debug(
      { appointmentId, customerId, phone: maskify(trimmedPhone) },
      "Sending text message",
    );

    const defaultAppsConfiguration =
      await this.configurationService.getConfiguration("defaultApps");
    const textMessageSenderAppId =
      defaultAppsConfiguration?.textMessageSender?.appId;

    let sendTextMessage: (message: TextMessage) => Promise<TextMessageResponse>;
    if (textMessageSenderAppId) {
      logger.debug(
        { textMessageSenderAppId },
        "Using app-based text message sender app",
      );
      const { app, service } =
        await this.connectedAppService.getAppService<ITextMessageSenderApp>(
          textMessageSenderAppId,
        );

      sendTextMessage = async (message: TextMessage) =>
        await service.sendTextMessage(app, message);
    } else {
      logger.debug(
        "No app-based text message sender app is configured, using default text message sender service",
      );
      sendTextMessage = async (message: TextMessage) =>
        await this.defaultTextMessageSender.sendTextMessage(
          this.companyId,
          message,
        );
    }

    try {
      const response = await sendTextMessage({
        message: body,
        phone: trimmedPhone,
        data: webhookData,
        sender,
      });

      if (response.error) {
        throw Error(response.error);
      }

      logger.info(
        {
          textMessageSender: "built-in-textbelt",
          textMessageSenderParticipant: handledBy,
          textMessageSenderPhone: maskify(trimmedPhone),
          appointmentId,
          customerId,
        },
        "Text Message sent via built-in TextBelt",
      );

      this.communicationLogService.log({
        direction: "outbound",
        channel: "text-message",
        handledBy,
        participantType,
        participant: phone,
        text: body,
        appointmentId,
        customerId,
        data: response,
      });

      return response;
    } catch (error) {
      logger.error(
        { error },
        "Error sending Text Message via built-in TextBelt",
      );
      throw error;
    }
  }
}

export class SystemNotificationService implements ISystemNotificationService {
  protected readonly loggerFactory = getLoggerFactory(
    "SystemNotificationService",
  );

  public constructor(private readonly emailService: IMailSender) {}

  public async sendSystemEmail(email: Email): Promise<void> {
    const logger = this.loggerFactory("sendSystemEmail");
    logger.info({ email }, "Sending system email");
    try {
      await this.emailService.sendMail(email);
      logger.info({ email }, "System email sent");
    } catch (error) {
      logger.error({ error }, "Error sending system email");
      throw error;
    }
  }
}
