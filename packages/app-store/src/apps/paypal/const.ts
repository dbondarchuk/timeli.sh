export const PAYPAL_APP_NAME = "paypal";

export const PAYPAL_TRANSACTION_SYNC_JOB_TYPE = "sync-in-store-transactions";
export const PAYPAL_TRANSACTION_SYNC_INTERVAL_SECONDS = 60 * 60;
/** How far back each poll queries Transaction Search (dedup handles repeats). */
export const PAYPAL_TRANSACTION_SYNC_LOOKBACK_SECONDS = 24 * 60 * 60;

export const getPaypalTransactionSyncSchedulerId = (appId: string): string =>
  `paypal-transaction-sync-${appId}`;
