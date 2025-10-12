import { getLoggerFactory } from "@vivid/logger";
import {
  ConnectedAppData,
  ConnectedAppError,
  ConnectedAppStatusWithText,
  IConnectedApp,
  IConnectedAppProps,
  ITextMessageResponder,
  RespondResult,
  TextMessageReply,
} from "@vivid/types";
import { getArguments, template } from "@vivid/utils";
import { TextMessageAutoReplyConfiguration } from "./models";
import {
  TextMessageAutoReplyAdminAllKeys,
  TextMessageAutoReplyAdminKeys,
  TextMessageAutoReplyAdminNamespace,
} from "./translations/types";

export default class TextMessageAutoReplyConnectedApp
  implements IConnectedApp, ITextMessageResponder
{
  protected readonly loggerFactory = getLoggerFactory(
    "TextMessageAutoReplyConnectedApp",
  );

  public constructor(protected readonly props: IConnectedAppProps) {}

  public async processRequest(
    appData: ConnectedAppData,
    data: TextMessageAutoReplyConfiguration,
  ): Promise<ConnectedAppStatusWithText> {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      {
        appId: appData._id,
        autoReplyTemplateId: data.autoReplyTemplateId,
      },
      "Processing Text Message Auto Reply configuration request",
    );

    try {
      logger.debug(
        { appId: appData._id, templateId: data.autoReplyTemplateId },
        "Validating auto reply template",
      );

      const template = await this.props.services
        .TemplatesService()
        .getTemplate(data.autoReplyTemplateId);

      if (!template) {
        logger.error(
          { appId: appData._id, templateId: data.autoReplyTemplateId },
          "Auto reply template not found",
        );
        throw new ConnectedAppError<
          TextMessageAutoReplyAdminNamespace,
          TextMessageAutoReplyAdminKeys
        >("app_text-message-auto-reply_admin.statusText.template_not_found");
      }

      logger.debug(
        {
          appId: appData._id,
          templateId: data.autoReplyTemplateId,
          templateName: template.name,
        },
        "Auto reply template validated successfully",
      );

      const status: ConnectedAppStatusWithText<
        TextMessageAutoReplyAdminNamespace,
        TextMessageAutoReplyAdminKeys
      > = {
        status: "connected",
        statusText:
          "app_text-message-auto-reply_admin.statusText.successfully_set_up",
      };

      this.props.update({
        data,
        ...status,
      });

      logger.info(
        { appId: appData._id, templateId: data.autoReplyTemplateId },
        "Successfully configured Text Message Auto Reply",
      );

      return status;
    } catch (e: any) {
      logger.error(
        {
          appId: appData._id,
          templateId: data.autoReplyTemplateId,
          error: e?.message || e?.toString(),
        },
        "Error processing Text Message Auto Reply configuration request",
      );

      const status: ConnectedAppStatusWithText = {
        status: "failed",
        statusText:
          e instanceof ConnectedAppError
            ? {
                key: e.key,
                args: e.args,
              }
            : ("app_text-message-auto-reply_admin.statusText.error_processing_configuration" satisfies TextMessageAutoReplyAdminAllKeys),
      };

      this.props.update({
        ...status,
      });

      return status;
    }
  }

  public async respond(
    appData: ConnectedAppData<TextMessageAutoReplyConfiguration>,
    textMessageReply: TextMessageReply,
  ): Promise<RespondResult | null> {
    const logger = this.loggerFactory("respond");
    logger.debug(
      {
        appId: appData._id,
        fromNumber: textMessageReply.from,
        messageLength: textMessageReply.message.length,
        hasAppointment: !!textMessageReply.appointment,
        hasCustomer: !!textMessageReply.customer,
        autoReplyTemplateId: appData.data?.autoReplyTemplateId,
      },
      "Processing text message auto reply",
    );

    try {
      const config = await this.props.services
        .ConfigurationService()
        .getConfigurations("booking", "general", "social");

      const { appointment, customer, ...reply } = textMessageReply;

      const args = getArguments({
        appointment,
        config,
        customer,
        useAppointmentTimezone: true,
        additionalProperties: {
          reply,
        },
        locale: config.general.language,
      });

      if (appData.data?.autoReplyTemplateId) {
        logger.debug(
          { appId: appData._id, templateId: appData.data.autoReplyTemplateId },
          "Retrieving auto reply template",
        );

        const autoReplyTemplate = await this.props.services
          .TemplatesService()
          .getTemplate(appData.data.autoReplyTemplateId);

        if (autoReplyTemplate) {
          logger.info(
            {
              appId: appData._id,
              templateId: autoReplyTemplate._id,
              templateName: autoReplyTemplate.name,
              fromNumber: reply.from,
            },
            "Auto replying with template",
          );

          const message = template(autoReplyTemplate.value, args);

          logger.debug(
            {
              appId: appData._id,
              templateId: autoReplyTemplate._id,
              messageLength: message.length,
              fromNumber: reply.from,
            },
            "Sending auto reply text message",
          );

          await this.props.services.NotificationService().sendTextMessage({
            body: message,
            handledBy: "textMessageAutoReply.handler",
            phone: reply.from,
            participantType: "customer",
            appointmentId: reply.data?.appointmentId,
            customerId: reply.data?.customerId,
            sender: config.general.name,
            webhookData: reply.data,
          });

          logger.info(
            {
              appId: appData._id,
              templateId: autoReplyTemplate._id,
              fromNumber: reply.from,
            },
            "Successfully sent auto reply text message",
          );

          return {
            handledBy:
              "app_text-message-auto-reply_admin.handler" satisfies TextMessageAutoReplyAdminAllKeys,
            participantType: "customer",
          };
        } else {
          logger.error(
            {
              appId: appData._id,
              templateId: appData.data.autoReplyTemplateId,
            },
            "Auto reply template not found",
          );

          this.props.update({
            status: "failed",
            statusText:
              "app_text-message-auto-reply_admin.statusText.template_not_found" satisfies TextMessageAutoReplyAdminAllKeys,
          });
        }
      } else {
        logger.warn(
          { appId: appData._id },
          "No auto reply template configured",
        );

        this.props.update({
          status: "failed",
          statusText:
            "app_text-message-auto-reply_admin.statusText.template_not_found" satisfies TextMessageAutoReplyAdminAllKeys,
        });
      }

      return null;
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          fromNumber: textMessageReply.from,
          error: error?.message || error?.toString(),
        },
        "Error processing text message auto reply",
      );
      throw error;
    }
  }
}
