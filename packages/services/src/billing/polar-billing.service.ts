import type {
  BillingInterval,
  BillingRecordSmsUsageInput,
  IBillingService,
  IOrganizationService,
  OrganizationBillingSubscriptionDetails,
  SmsCreditsState,
} from "@timelish/types";
import { BaseService } from "../services/base.service";
import type { PolarClientWrapper } from "./polar-client-wrapper";

export class PolarBillingService
  extends BaseService
  implements IBillingService
{
  public constructor(
    organizationId: string,
    private readonly organizationService: IOrganizationService,
    private readonly polar: PolarClientWrapper,
  ) {
    super("PolarBillingService", organizationId);
  }

  async getSmsCreditBalance(): Promise<SmsCreditsState> {
    const logger = this.loggerFactory("getSmsCreditBalance");
    const org = await this.organizationService.getOrganization();
    logger.debug({ org }, "Getting Polar SMS credit balance");

    if (org?.feesExempt === true) {
      logger.debug("Organization is fees exempt");
      return { feesExempt: true };
    }

    if (!this.polar.client) {
      logger.warn("Polar client not found");
      return { feesExempt: false, balance: 0, amountUsed: 0, totalAmount: 0 };
    }

    try {
      if (this.polar.config.smsCreditsMeterId) {
        const row = await this.polar.getCustomerMeterRow({
          externalCustomerId: this.organizationId,
          meterId: this.polar.config.smsCreditsMeterId,
        });

        logger.debug({ row }, "Polar customer meter row found");

        if (row) {
          return {
            feesExempt: false,
            balance: Math.max(0, row.balance),
            amountUsed: row.consumedUnits,
            totalAmount: row.creditedUnits,
          };
        }
      }
    } catch (error) {
      logger.warn({ error }, "Polar SMS credit balance lookup failed");
    }

    logger.warn("Polar customer meter row not found or not configured");

    return {
      feesExempt: false,
      balance: 0,
      amountUsed: 0,
      totalAmount: 0,
    };
  }

  async recordSmsCreditUsage(input: BillingRecordSmsUsageInput): Promise<void> {
    const logger = this.loggerFactory("recordSmsCreditUsage");
    const eventName = this.polar.config.smsUsageEventName.trim();
    if (!eventName) {
      logger.warn("Polar SMS usage event name not configured");
      return;
    }

    const textId = input.textId?.trim();
    const externalId = textId ? `sms_${input.direction}_${textId}` : undefined;

    try {
      logger.debug(
        { eventName, externalId },
        "Ingesting Polar SMS usage event",
      );
      await this.polar.ingestMeteredEvents([
        {
          name: eventName,
          externalCustomerId: this.organizationId,
          ...(externalId ? { externalId } : {}),
          metadata: {
            direction: input.direction,
            organization_id: this.organizationId,
          },
        },
      ]);

      logger.debug(
        { eventName, externalId },
        "Polar SMS usage event ingested successfully",
      );
    } catch (error) {
      logger.warn({ error }, "Polar SMS usage event ingest failed");
    }
  }

  async getSubscriptionDetails(): Promise<OrganizationBillingSubscriptionDetails> {
    const logger = this.loggerFactory("getSubscriptionDetails");
    const org = await this.organizationService.getOrganization();

    logger.debug({ org }, "Getting Polar subscription details");

    const feesExempt = org?.feesExempt === true;
    const subscriptionId = org?.polarSubscriptionId?.trim() ?? null;
    const statusFromDb = org?.polarSubscriptionStatus ?? null;

    const empty = (): OrganizationBillingSubscriptionDetails => ({
      feesExempt,
      subscriptionId,
      subscriptionName: null,
      status: statusFromDb,
      subscriptionPrice: null,
      nextCycleDate: null,
      benefits: { sms: null },
    });

    if (feesExempt) {
      logger.debug("Organization is fees exempt");
      return empty();
    }

    if (!this.polar.client || !subscriptionId) {
      logger.warn(
        { subscriptionId },
        "Polar client not found or subscription id not found",
      );
      return empty();
    }

    try {
      logger.debug({ subscriptionId }, "Getting Polar subscription details");
      const sub = await this.polar.getSubscriptionById(subscriptionId);
      logger.debug({ sub }, "Polar subscription details found");
      const subscriptionPrice = {
        amountCents: sub.amount,
        currency: sub.currency,
        recurringInterval: sub.recurringInterval as BillingInterval,
      };

      const subscriptionName = sub.product?.name ?? null;
      const status = String(sub.status);
      const nextCycleEnd = sub.currentPeriodEnd ?? null;

      let sms: OrganizationBillingSubscriptionDetails["benefits"]["sms"] = null;
      const customerId = sub.customerId?.trim();
      if (this.polar.config.smsCreditsMeterId && customerId) {
        logger.debug({ customerId }, "Getting Polar customer meter row");
        const row = await this.polar.getCustomerMeterRow({
          customerId,
          meterId: this.polar.config.smsCreditsMeterId,
        });
        logger.debug({ row }, "Polar customer meter row found");
        if (row) {
          sms = {
            balance: Math.max(0, row.balance),
            amountUsed: row.consumedUnits,
            totalAmount: row.creditedUnits,
            nextRefreshDate: nextCycleEnd,
          };
        }
      }

      const result = {
        feesExempt: false,
        subscriptionId,
        subscriptionName,
        status,
        subscriptionPrice,
        nextCycleDate: nextCycleEnd,
        benefits: { sms },
      };

      logger.debug({ result }, "Polar subscription details found");
      return result;
    } catch (error) {
      logger.warn(
        { error },
        "Could not load Polar subscription for billing details",
      );

      return empty();
    }
  }
}
