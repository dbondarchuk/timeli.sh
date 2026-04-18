import { BillingRecordSmsUsageInput, SmsCreditsState } from "../billing/sms";
import { OrganizationBillingSubscriptionDetails } from "../billing/subscription-details";

export interface IBillingService {
  getSmsCreditBalance(): Promise<SmsCreditsState>;

  recordSmsCreditUsage(input: BillingRecordSmsUsageInput): Promise<void>;

  getSubscriptionDetails(): Promise<OrganizationBillingSubscriptionDetails>;
}
