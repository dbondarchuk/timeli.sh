import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ApiRequest,
  ApiResponse,
  Appointment,
  AppointmentAddon,
  AppointmentAddonUpdateModel,
  AppointmentOption,
  AppointmentOptionUpdateModel,
  AppointmentStatus,
  ConnectedAppData,
  ConnectedAppRequestError,
  ConnectedAppStatusWithText,
  Customer,
  CustomerUpdateModel,
  Discount,
  DiscountUpdateModel,
  GiftCardListModel,
  GiftCardStatus,
  GiftCardUpdateModel,
  IAddonHook,
  IAppointmentHook,
  IConnectedApp,
  IConnectedAppProps,
  ICustomerHook,
  IDiscountHook,
  IFieldHook,
  IGiftCardHook,
  IPaymentHook,
  IServiceHook,
  Payment,
  PaymentUpdateModel,
  ServiceField,
  ServiceFieldUpdateModel,
} from "@timelish/types";
import { decrypt, encrypt } from "@timelish/utils";
import crypto from "crypto";
import type { FormModel, FormResponseModel } from "../forms/models/form";
import type { IFormsHook } from "../forms/models/hook";
import type { WaitlistEntry } from "../waitlist/models/waitlist";
import type { IWaitlistHook } from "../waitlist/models/waitlist-hook";
import {
  MASKED_SECRET,
  WebhookEventType,
  WebhooksConfiguration,
  webhooksConfigurationSchema,
} from "./models";
import {
  WebhooksAdminAllKeys,
  WebhooksAdminKeys,
  WebhooksAdminNamespace,
} from "./translations/types";

export class WebhooksConnectedApp
  implements
    IConnectedApp,
    IAppointmentHook,
    ICustomerHook,
    IPaymentHook,
    IWaitlistHook,
    IFormsHook,
    IGiftCardHook,
    IDiscountHook,
    IServiceHook,
    IAddonHook,
    IFieldHook
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "WebhooksConnectedApp",
      props.organizationId,
    );
  }

  public async processAppData(
    appData: WebhooksConfiguration,
  ): Promise<WebhooksConfiguration> {
    return {
      ...appData,
      secret: appData.secret ? MASKED_SECRET : "",
    };
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: WebhooksConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<WebhooksAdminNamespace, WebhooksAdminKeys>
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      { appId: appData._id },
      "Processing webhooks configuration request",
    );

    const { success, error } = webhooksConfigurationSchema.safeParse(data);
    if (!success) {
      logger.warn(
        { appId: appData._id, error },
        "Invalid webhooks configuration data",
      );

      throw new ConnectedAppRequestError(
        "invalid_webhooks_configuration",
        { data },
        400,
        error.message,
      );
    }

    // Handle secret encryption
    if (data.secret === MASKED_SECRET && appData?.data?.secret) {
      data.secret = appData.data.secret;
    } else if (data.secret) {
      data.secret = encrypt(data.secret);
    }

    const status: ConnectedAppStatusWithText<
      WebhooksAdminNamespace,
      WebhooksAdminKeys
    > = {
      status: "connected",
      statusText: "app_webhooks_admin.statusText.successfullyConfigured",
    };

    this.props.update({
      data,
      ...status,
    });

    logger.info({ appId: appData._id }, "Successfully configured webhooks");
    return status;
  }

  public async unInstall(appData: ConnectedAppData): Promise<void> {
    const logger = this.loggerFactory("unInstall");
    logger.debug({ appId: appData._id }, "Uninstalling webhooks app");

    // No cleanup needed for webhooks
    logger.info(
      { appId: appData._id },
      "Successfully uninstalled webhooks app",
    );
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: ApiRequest,
  ): Promise<ApiResponse> {
    return Response.json(
      { success: false, error: "Unknown request" },
      { status: 404 },
    );
  }

  // Appointment Hooks
  public async onAppointmentCreated(
    appData: ConnectedAppData,
    appointment: Appointment,
    confirmed: boolean,
  ): Promise<void> {
    await this.sendWebhook(appData, "appointment.created", {
      appointment,
      confirmed,
    });
  }

  public async onAppointmentStatusChanged(
    appData: ConnectedAppData,
    appointment: Appointment,
    newStatus: AppointmentStatus,
    oldStatus?: AppointmentStatus,
    by?: "customer" | "user",
  ): Promise<void> {
    await this.sendWebhook(appData, "appointment.status_changed", {
      appointment,
      newStatus,
      oldStatus,
      by,
    });
  }

  public async onAppointmentRescheduled(
    appData: ConnectedAppData,
    appointment: Appointment,
    newTime: Date,
    newDuration: number,
    oldTime?: Date,
    oldDuration?: number,
    doNotNotifyCustomer?: boolean,
  ): Promise<void> {
    await this.sendWebhook(appData, "appointment.rescheduled", {
      appointment,
      newTime,
      newDuration,
      oldTime,
      oldDuration,
      doNotNotifyCustomer,
    });
  }

  // Customer Hooks
  public async onCustomerCreated(
    appData: ConnectedAppData,
    customer: Customer,
  ): Promise<void> {
    await this.sendWebhook(appData, "customer.created", { customer });
  }

  public async onCustomerUpdated(
    appData: ConnectedAppData,
    customer: Customer,
    update: CustomerUpdateModel,
  ): Promise<void> {
    await this.sendWebhook(appData, "customer.updated", {
      customer,
      update,
    });
  }

  public async onCustomersDeleted(
    appData: ConnectedAppData,
    customers: Customer[],
  ): Promise<void> {
    await this.sendWebhook(appData, "customers.deleted", { customers });
  }

  // Payment Hooks
  public async onPaymentCreated(
    appData: ConnectedAppData,
    payment: Payment,
  ): Promise<void> {
    await this.sendWebhook(appData, "payment.created", { payment });
  }

  public async onPaymentUpdated(
    appData: ConnectedAppData,
    payment: Payment,
    update: Partial<PaymentUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "payment.updated", {
      payment,
      update,
    });
  }

  public async onPaymentDeleted(
    appData: ConnectedAppData,
    payment: Payment,
  ): Promise<void> {
    await this.sendWebhook(appData, "payment.deleted", { payment });
  }

  public async onPaymentRefunded(
    appData: ConnectedAppData,
    payment: Payment,
    refundAmount: number,
  ): Promise<void> {
    await this.sendWebhook(appData, "payment.refunded", {
      payment,
      refundAmount,
    });
  }

  // Waitlist Hooks
  public async onWaitlistEntryCreated(
    appData: ConnectedAppData,
    waitlistEntry: WaitlistEntry,
  ): Promise<void> {
    await this.sendWebhook(appData, "waitlist-entry.created", {
      waitlistEntry,
    });
  }

  public async onWaitlistEntryDismissed(
    appData: ConnectedAppData,
    waitlistEntries: WaitlistEntry[],
  ): Promise<void> {
    await this.sendWebhook(appData, "waitlist-entries.dismissed", {
      waitlistEntries,
    });
  }

  // Form Hooks
  public async onFormResponseCreated(
    appData: ConnectedAppData,
    response: FormResponseModel,
    form: FormModel,
    customer?: Customer | null,
  ): Promise<void> {
    await this.sendWebhook(appData, "form-response.created", {
      response,
      form,
      customer,
    });
  }

  // Gift Card Hooks
  public async onGiftCardCreated(
    appData: ConnectedAppData,
    giftCard: GiftCardListModel,
  ): Promise<void> {
    await this.sendWebhook(appData, "gift-card.created", { giftCard });
  }

  public async onGiftCardUpdated(
    appData: ConnectedAppData,
    giftCard: GiftCardListModel,
    update: Partial<GiftCardUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "gift-card.updated", { giftCard, update });
  }

  public async onGiftCardsDeleted(
    appData: ConnectedAppData,
    giftCardsIds: string[],
  ): Promise<void> {
    await this.sendWebhook(appData, "gift-card.deleted", { giftCardsIds });
  }

  public async onGiftCardsStatusChanged(
    appData: ConnectedAppData,
    giftCardsIds: string[],
    status: GiftCardStatus,
  ): Promise<void> {
    await this.sendWebhook(appData, "gift-card.status_changed", {
      giftCardsIds,
      status,
    });
  }

  // Discount Hooks

  public async onDiscountCreated(
    appData: ConnectedAppData,
    discount: Discount,
  ): Promise<void> {
    await this.sendWebhook(appData, "discount.created", { discount });
  }

  public async onDiscountUpdated(
    appData: ConnectedAppData,
    discount: Discount,
    update: Partial<DiscountUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "discount.updated", { discount, update });
  }

  public async onDiscountsDeleted(
    appData: ConnectedAppData,
    discountsIds: string[],
  ): Promise<void> {
    await this.sendWebhook(appData, "discount.deleted", { discountsIds });
  }

  public async onDiscountApplied(
    appData: ConnectedAppData,
    customer: Customer,
    discount: {
      id: string;
      name: string;
      value: number;
      code: string;
      dateTime: Date;
      appointmentId?: string;
      appointmentOptionId?: string;
      appointmentAddonIds?: string[];
      appointmentTotalPrice?: number;
      appointmentDateTime?: Date;
    },
  ): Promise<void> {
    await this.sendWebhook(appData, "discount.applied", { customer, discount });
  }

  // Service Hooks

  public async onServiceCreated(
    appData: ConnectedAppData,
    service: AppointmentOption,
  ): Promise<void> {
    await this.sendWebhook(appData, "service.created", { service });
  }

  public async onServiceUpdated(
    appData: ConnectedAppData,
    service: AppointmentOption,
    update: Partial<AppointmentOptionUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "service.updated", { service, update });
  }

  public async onServicesDeleted(
    appData: ConnectedAppData,
    servicesIds: string[],
  ): Promise<void> {
    await this.sendWebhook(appData, "service.deleted", { servicesIds });
  }

  // Addon Hooks

  public async onAddonCreated(
    appData: ConnectedAppData,
    addon: AppointmentAddon,
  ): Promise<void> {
    await this.sendWebhook(appData, "addon.created", { addon });
  }

  public async onAddonUpdated(
    appData: ConnectedAppData,
    addon: AppointmentAddon,
    update: Partial<AppointmentAddonUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "addon.updated", { addon, update });
  }

  public async onAddonsDeleted(
    appData: ConnectedAppData,
    addonsIds: string[],
  ): Promise<void> {
    await this.sendWebhook(appData, "addon.deleted", { addonsIds });
  }

  // Field Hooks

  public async onFieldCreated(
    appData: ConnectedAppData,
    field: ServiceField,
  ): Promise<void> {
    await this.sendWebhook(appData, "field.created", { field });
  }

  public async onFieldUpdated(
    appData: ConnectedAppData,
    field: ServiceField,
    update: Partial<ServiceFieldUpdateModel>,
  ): Promise<void> {
    await this.sendWebhook(appData, "field.updated", { field, update });
  }

  public async onFieldsDeleted(
    appData: ConnectedAppData,
    fieldsIds: string[],
  ): Promise<void> {
    await this.sendWebhook(appData, "field.deleted", { fieldsIds });
  }

  private async sendWebhook(
    appData: ConnectedAppData<WebhooksConfiguration>,
    eventType: WebhookEventType,
    payload: any,
  ): Promise<void> {
    const logger = this.loggerFactory("sendWebhook");
    const config = appData.data;

    if (!config) {
      logger.warn(
        { appId: appData._id, eventType },
        "No webhooks configuration found",
      );
      return;
    }

    // Check if this event type is enabled for this webhook
    if (!config.eventTypes.includes(eventType as any)) {
      logger.debug(
        { appId: appData._id, eventType },
        "Event type not enabled for this webhook",
      );
      return;
    }

    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": eventType,
    };

    // Add signature if secret is provided
    if (config.secret) {
      const decryptedSecret = decrypt(config.secret);
      const signature = this.generateSignature(body, decryptedSecret);
      headers["X-Webhook-Signature"] = signature;
    }

    try {
      logger.debug(
        { appId: appData._id, eventType, url: config.url },
        "Sending webhook",
      );

      const response = await fetch(config.url, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        logger.error(
          {
            appId: appData._id,
            eventType,
            url: config.url,
            status: response.status,
            statusText: response.statusText,
          },
          "Webhook request failed",
        );

        this.props.update({
          status: "failed",
          statusText: {
            key: "app_webhooks_admin.statusText.webhook_request_failed" satisfies WebhooksAdminAllKeys,
            args: {
              status: response.status,
              statusText: response.statusText,
            },
          },
        });
      } else {
        logger.info(
          {
            appId: appData._id,
            eventType,
            url: config.url,
            status: response.status,
          },
          "Webhook sent successfully",
        );
      }
    } catch (error: any) {
      logger.error(
        {
          appId: appData._id,
          eventType,
          url: config.url,
          error: error?.message || error?.toString(),
        },
        "Error sending webhook",
      );
    }
  }

  private generateSignature(payload: string, secret: string): string {
    return `sha256=${crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")}`;
  }
}
