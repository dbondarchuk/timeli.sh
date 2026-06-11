import {
  HydratedSyncedPayment,
  SyncedPayment,
  SyncedPaymentStatus,
  SyncedPaymentTransaction,
} from "../booking";
import { Query, WithTotal } from "../database";
import type { EventSource } from "../events/envelope";
import { DateRange } from "../general";

export type IngestSyncedPaymentOptions = {
  /**
   * How loosely (in minutes) an appointment start time may differ from the
   * transaction time to still be considered a candidate. Defaults to 240.
   */
  matchWindowMinutes?: number;
};

export interface ISyncedPaymentsService {
  /**
   * Ingests a normalized in-store transaction from a payment provider:
   * deduplicates, finds candidate appointments, auto-attaches the best one
   * (splitting any overpayment into a tip), and records the result. When no
   * candidate is found the transaction is parked in the unmatched queue.
   */
  ingest(
    transaction: SyncedPaymentTransaction,
    source: EventSource,
    options?: IngestSyncedPaymentOptions,
  ): Promise<SyncedPayment>;

  list(
    query: Query & {
      status?: SyncedPaymentStatus[];
      /** Filters by transaction time. */
      range?: DateRange;
      /** Filters to a single provider transaction (capture) id. */
      externalId?: string;
    },
  ): Promise<WithTotal<HydratedSyncedPayment>>;

  get(id: string): Promise<HydratedSyncedPayment | null>;

  /** Marks an auto-matched record as confirmed by staff. */
  confirm(id: string, source: EventSource): Promise<SyncedPayment>;

  /** Rejects a match, removing any payments that were created. */
  reject(id: string, source: EventSource): Promise<SyncedPayment>;

  /** Moves the synced payment to a different appointment, recomputing the tip split. */
  reassign(
    id: string,
    appointmentId: string,
    source: EventSource,
  ): Promise<SyncedPayment>;

  /** Assigns an unmatched synced payment to an appointment. */
  assign(
    id: string,
    appointmentId: string,
    source: EventSource,
  ): Promise<SyncedPayment>;

  /** Dismisses a synced payment without assigning it, removing any payments. */
  ignore(id: string, source: EventSource): Promise<SyncedPayment>;

  /**
   * Updates the service-payment and tip amounts of an assigned synced payment,
   * recreating the linked payment records to reflect the new split. Pass a tip
   * of 0 to remove the tip.
   */
  updateAmounts(
    id: string,
    amounts: { paymentAmount: number; tip: number },
    source: EventSource,
  ): Promise<SyncedPayment>;

  /** Reverts the amounts back to the originally computed split. */
  revertAmounts(id: string, source: EventSource): Promise<SyncedPayment>;

  /** Count of synced payments awaiting staff review (matched or unmatched). */
  getReviewQueueCount(): Promise<number>;
}
