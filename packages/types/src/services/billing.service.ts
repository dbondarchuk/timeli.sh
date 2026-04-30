import {
  BillingConsumeSmsInput,
  BillingRecordSmsUsageInput,
  SmsCreditsState,
} from "../billing/sms";
import { OrganizationBillingSubscriptionDetails } from "../billing/subscription-details";

export interface IBillingService {
  getSmsCreditBalance(): Promise<SmsCreditsState>;

  /** Sum of `included` + `topup` in DB; `null` when fees-exempt. */
  getCurrentSmsBalanceTotal(): Promise<number | null>;

  /**
   * Decrements DB pools (included first), ingests usage to Polar, may emit low/exhausted events.
   */
  consumeSmsCredits(input: BillingConsumeSmsInput): Promise<void>;

  addTopupSmsCredits(amount: number): Promise<void>;

  setIncludedSmsCredits(amount: number): Promise<void>;

  /** @deprecated Use `consumeSmsCredits` with `amount: 1`. */
  recordSmsCreditUsage(input: BillingRecordSmsUsageInput): Promise<void>;

  getSubscriptionDetails(): Promise<OrganizationBillingSubscriptionDetails>;
}
