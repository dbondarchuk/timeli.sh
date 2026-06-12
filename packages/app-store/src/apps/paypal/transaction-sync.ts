import { LoggerFactory } from "@timelish/logger";
import { ConnectedAppData, PaymentFee } from "@timelish/types";
import { PaypalClient, PaypalTransactionDetail } from "./client";
import { PAYPAL_TRANSACTION_SYNC_LOOKBACK_SECONDS } from "./const";
import { PaypalConfiguration } from "./models";

export type InStoreCaptureInput = {
  captureId: string;
  orderId?: string;
  amount: number;
  currency: string;
  transactionTime: Date;
  fees?: PaymentFee[];
  breakdown?: unknown;
  raw?: unknown;
  providerSplit?: { paymentAmount: number; tip: number };
};

export type InStoreCaptureIngestResult = "ingested" | "skipped" | "already_exists";

export type PaypalTransactionSyncDeps = {
  appData: ConnectedAppData<PaypalConfiguration>;
  client: PaypalClient;
  ingest: (capture: InStoreCaptureInput) => Promise<InStoreCaptureIngestResult>;
  logger: ReturnType<LoggerFactory>;
};

export function computeSyncWindow(now: Date): { start: Date; end: Date } {
  const end = now;
  const start = new Date(
    end.getTime() - PAYPAL_TRANSACTION_SYNC_LOOKBACK_SECONDS * 1000,
  );
  return { start, end };
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Derives payment vs tip from PayPal cart line items when cart_info is present.
 * Payment amount is the sum of item totals; any remainder of the transaction
 * gross is treated as tip (e.g. an explicit tip or gratuity line not in cart).
 */
export function extractCartSplit(
  detail: PaypalTransactionDetail,
  transactionAmount: number,
): { paymentAmount: number; tip: number } | undefined {
  const items = detail.cart_info?.item_details;
  if (!items?.length) {
    return undefined;
  }

  let cartTotal = 0;
  for (const item of items) {
    const itemTotal = parseFloat(item.total_item_amount?.value ?? "");
    if (!Number.isFinite(itemTotal) || itemTotal < 0) {
      return undefined;
    }
    cartTotal += itemTotal;
  }

  cartTotal = round2(cartTotal);
  const amount = round2(transactionAmount);

  if (cartTotal <= 0 || cartTotal > amount) {
    return undefined;
  }

  const tip = round2(amount - cartTotal);
  if (tip < 0) {
    return undefined;
  }

  if (Math.abs(cartTotal + tip - amount) > 0.01) {
    return undefined;
  }

  return { paymentAmount: cartTotal, tip };
}

export function mapTransactionDetailToCapture(
  detail: PaypalTransactionDetail,
): InStoreCaptureInput | null {
  const info = detail.transaction_info;
  const captureId = info?.transaction_id;
  if (!captureId) {
    return null;
  }

  const amount = parseFloat(info.transaction_amount?.value ?? "") || 0;
  const currency = info.transaction_amount?.currency_code;
  if (!currency || amount <= 0) {
    return null;
  }

  const orderId =
    info.paypal_reference_id_type === "ODR"
      ? info.paypal_reference_id
      : undefined;

  const feeValue = parseFloat(info.fee_amount?.value ?? "") || 0;
  const fees =
    feeValue !== 0
      ? [
          {
            type: "transaction" as const,
            amount: Math.abs(feeValue),
          },
        ]
      : undefined;

  const transactionTime = info.transaction_initiation_date
    ? new Date(info.transaction_initiation_date)
    : new Date();

  const providerSplit = extractCartSplit(detail, amount);

  return {
    captureId,
    orderId,
    amount,
    currency,
    transactionTime,
    fees,
    providerSplit,
    raw: detail,
  };
}

export async function runPaypalTransactionSync(
  deps: PaypalTransactionSyncDeps,
): Promise<void> {
  const { appData, client, ingest, logger } = deps;
  const now = new Date();
  const { start, end } = computeSyncWindow(now);

  logger.debug(
    { appId: appData._id, start, end },
    "Polling PayPal transactions",
  );

  const result = await client.listAllTransactions(start, end);
  if (result.error) {
    logger.warn(
      {
        appId: appData._id,
        statusCode: result.error.statusCode,
        start,
        end,
      },
      "Failed to list PayPal transactions",
    );
    throw new Error(
      `PayPal transaction list failed with status ${result.error.statusCode ?? "unknown"}`,
    );
  }

  let ingested = 0;
  let skipped = 0;
  let alreadyExists = 0;

  for (const detail of result.transactionDetails) {
    const capture = mapTransactionDetailToCapture(detail);
    if (!capture) {
      skipped += 1;
      continue;
    }

    const outcome = await ingest(capture);
    if (outcome === "ingested") {
      ingested += 1;
    } else if (outcome === "already_exists") {
      alreadyExists += 1;
    } else {
      skipped += 1;
    }
  }

  logger.info(
    {
      appId: appData._id,
      total: result.transactionDetails.length,
      ingested,
      skipped,
      alreadyExists,
      start,
      end,
    },
    "Completed PayPal transaction sync poll",
  );
}
