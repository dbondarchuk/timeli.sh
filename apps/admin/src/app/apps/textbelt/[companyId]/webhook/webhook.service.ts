import { getTextBeltWebhookEmailTemplate } from "@timelish/app-store/exports";
import { BaseAllKeys } from "@timelish/i18n";
import { getLoggerFactory } from "@timelish/logger";
import { TextBeltConfiguration } from "@timelish/services";
import {
  ApiRequest,
  ApiResponse,
  ICommunicationLogsService,
  IConfigurationService,
  IConnectedAppsService,
  ICustomersService,
  IEventsService,
  INotificationService,
  IOrganizationService,
  ITextMessageResponder,
  RespondResult,
  TextMessageReply,
} from "@timelish/types";
import {
  getAdminUrl,
  getArguments,
  getWebsiteUrl,
  maskify,
} from "@timelish/utils";
import crypto from "crypto";

type TextbeltWebhookData = {
  textId: string;
  fromNumber: string;
  text: string;
  data?: string;
};

const verifyWebhook = (
  apiKey: string,
  timestamp: string,
  requestSignature: string,
  requestPayload: string,
): boolean => {
  const mySignature = crypto
    .createHmac("sha256", apiKey)
    .update(timestamp + requestPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(requestSignature),
    Buffer.from(mySignature),
  );
};

export class TextBeltWebhookService {
  protected readonly loggerFactory = getLoggerFactory("TextBeltWebhookService");

  constructor(
    private readonly companyId: string,
    private readonly configuration: TextBeltConfiguration,
    private readonly configurationService: IConfigurationService,
    private readonly connectedAppsService: IConnectedAppsService,
    private readonly eventsService: IEventsService,
    private readonly customersService: ICustomersService,
    private readonly communicationLogsService: ICommunicationLogsService,
    private readonly notificationService: INotificationService,
    private readonly organizationService: IOrganizationService,
  ) {}

  public async processWebhook(request: ApiRequest): Promise<ApiResponse> {
    const logger = this.loggerFactory("processWebhook");
    logger.debug({ companyId: this.companyId }, "Processing TextBelt webhook");

    try {
      const bodyText = await request.text();
      const timestamp = request.headers.get("X-textbelt-timestamp");
      const signature = request.headers.get("X-textbelt-signature");

      logger.debug(
        {
          hasTimestamp: !!timestamp,
          hasSignature: !!signature,
        },
        "Extracted webhook headers",
      );

      if (!timestamp || !signature) {
        logger.warn({ bodyText }, "Malformed headers in SMS webhook");
        return Response.json({ success: false }, { status: 400 });
      }

      if (
        !verifyWebhook(
          this.configuration.apiKey,
          timestamp,
          signature,
          bodyText,
        )
      ) {
        logger.warn({ bodyText }, "Unverified SMS webhook");
        return Response.json({ success: false }, { status: 400 });
      }

      logger.debug("Webhook signature verified successfully");

      const reply = JSON.parse(bodyText) as TextbeltWebhookData;
      if (!reply.fromNumber) {
        logger.warn({ bodyText }, "Malformed body in SMS webhook");
        return Response.json({ success: false }, { status: 400 });
      }

      logger.info(
        {
          fromNumber: maskify(reply.fromNumber),
          textId: reply.textId,
          hasData: !!reply.data,
        },
        "Received TextBelt reply webhook",
      );

      const parts = (reply?.data || "").split("|", 4);

      const appId = parts[0] || undefined;
      const appointmentId = parts[1] || undefined;
      const customerId = parts[2] || undefined;
      const data = parts[3] || undefined;

      logger.debug(
        {
          parsedAppId: appId,
          appointmentId,
          customerId,
          hasData: !!data,
        },
        "Parsed webhook data",
      );

      const appointment = appointmentId
        ? await this.eventsService.getAppointment(appointmentId)
        : null;

      const customer = customerId
        ? await this.customersService.getCustomer(customerId)
        : (appointment?.customer ?? null);

      const replyData: TextMessageReply = {
        from: reply.fromNumber,
        message: reply.text,
        data: {
          appId,
          data,
          appointmentId,
          customerId,
        },
        appointment,
        customer,
        messageId: reply.textId,
      };

      logger.debug(
        { fromNumber: maskify(reply.fromNumber) },
        "Processing text message reply",
      );

      await this.respond(replyData);

      logger.info(
        { fromNumber: maskify(reply.fromNumber) },
        "Successfully processed TextBelt webhook",
      );

      return Response.json({ success: true }, { status: 201 });
    } catch (error: any) {
      logger.error(
        { error: error?.message || error?.toString() },
        "Error processing TextBelt webhook",
      );
      throw error;
    }
  }

  private async respond(textMessageReply: TextMessageReply): Promise<void> {
    const logger = this.loggerFactory("respond");
    logger.debug(
      {
        fromNumber: maskify(textMessageReply.from),
        messageLength: textMessageReply.message.length,
        hasAppointment: !!textMessageReply.appointment,
        hasCustomer: !!textMessageReply.customer,
      },
      "Processing text message reply",
    );

    const config = await this.configurationService.getConfigurations(
      "booking",
      "general",
      "social",
    );

    const { appointment, customer, ...reply } = textMessageReply;

    const organization = await this.organizationService.getOrganization();
    if (!organization) {
      logger.error(
        { appointmentId: appointment?._id },
        "Organization not found",
      );
      return;
    }

    const adminUrl = getAdminUrl();
    const websiteUrl = getWebsiteUrl(organization.slug, config.general.domain);

    const args = getArguments({
      appointment,
      config,
      customer,
      useAppointmentTimezone: true,
      additionalProperties: {
        reply: {
          ...reply,
          message: reply.message?.trim(),
        },
      },
      locale: config.general.language,
      adminUrl,
      websiteUrl,
    });

    const url = getAdminUrl();
    const { template: description, subject } =
      await getTextBeltWebhookEmailTemplate(
        "user-notify-reply",
        config.general.language,
        url,
        args,
        appointment?._id,
        customer?._id,
      );

    logger.debug(
      { ownerEmail: config.general.email },
      "Sending email to owner about incoming message",
    );

    await this.notificationService.sendEmail({
      email: {
        to: config.general.email,
        subject,
        body: description,
      },
      handledBy: "admin.textbelt-webhook.handledBy" satisfies BaseAllKeys,
      participantType: "user",
      appointmentId: appointment?._id,
      customerId: customer?._id,
    });

    let result: RespondResult | null | undefined;
    try {
      try {
        if (reply.data.appId && reply.data.appId.length) {
          logger.debug(
            { responderAppId: reply.data.appId },
            "Processing message with responder app",
          );

          const { app, service } =
            await this.connectedAppsService.getAppService<ITextMessageResponder>(
              reply.data.appId,
            );

          if (!!service?.respond) {
            logger.debug(
              { responderAppName: app?.name },
              "Incoming message will be processed by responder app",
            );
          }

          result = await service?.respond?.(app, textMessageReply);
        }
      } finally {
        if (!result) {
          logger.debug(
            "No service has processed the incoming text message. Will try to use responder app",
          );

          const defaultApps =
            await this.configurationService.getConfiguration("defaultApps");
          const textMessageResponderAppId =
            defaultApps.textMessageResponder?.appId;
          if (textMessageResponderAppId) {
            const { app, service } =
              await this.connectedAppsService.getAppService<ITextMessageResponder>(
                textMessageResponderAppId,
              );

            result = await service?.respond?.(app, textMessageReply);
          }
        }
      }
    } finally {
      if (!result) {
        logger.warn(
          "No responder app was registered with TextBelt Webhook or it was not processed",
        );

        result = {
          handledBy: "admin.textbelt-webhook.handledBy" satisfies BaseAllKeys,
          participantType: "customer",
        };
      }

      logger.debug(
        {
          handledBy: result.handledBy,
          participantType: result.participantType,
        },
        "Logging communication",
      );

      await this.communicationLogsService.log({
        channel: "text-message",
        direction: "inbound",
        participant: reply.from,
        participantType: result.participantType,
        handledBy: result.handledBy,
        text: reply.message,
        data: reply.data,
        appointmentId: appointment?._id,
        customerId: customer?._id,
      });

      logger.info(
        {
          fromNumber: maskify(textMessageReply.from),
          handledBy: result.handledBy,
        },
        "Successfully processed text message reply",
      );
    }
  }
}
