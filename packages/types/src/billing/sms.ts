import { Prettify } from "../utils";

export type BillingRecordSmsUsageInput = {
  direction: "inbound" | "outbound";
  textId?: string;
};

/** SMS meter benefit snapshot (numeric; format in UI with locale). */
export type OrganizationBillingSmsBenefit = {
  balance: number;
  /** Consumed units in the current cycle. */
  amountUsed: number;
  /** Credited / allowance units for the cycle. */
  totalAmount: number;
  /** Date for cycle refresh. */
  nextRefreshDate: Date | null;
};

export type SmsCreditsState = Prettify<
  | ({ feesExempt: false } & Omit<
      OrganizationBillingSmsBenefit,
      "nextRefreshDate"
    >)
  | ({ feesExempt: true } & Partial<
      Omit<OrganizationBillingSmsBenefit, "nextRefreshDate">
    >)
>;

export class SmsCreditsExhaustedError extends Error {
  readonly code = "sms_credits_exhausted" as const;

  constructor(
    message = "SMS subscription credits are exhausted. Add credits or upgrade your plan.",
  ) {
    super(message);
    this.name = "SmsCreditsExhaustedError";
  }
}
