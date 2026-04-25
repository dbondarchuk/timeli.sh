import {
  Payment,
  PaymentIntent,
  PaymentIntentUpdateModel,
  PaymentUpdateModel,
} from "../booking";
import type { EventSource } from "../events/envelope";

export interface IPaymentsService {
  createIntent(
    intent: Omit<PaymentIntentUpdateModel, "status">,
  ): Promise<PaymentIntent>;

  getIntent(id: string): Promise<PaymentIntent | null>;
  getIntentByExternalId(externalId: string): Promise<PaymentIntent | null>;

  updateIntent(
    id: string,
    update: Partial<PaymentIntentUpdateModel>,
  ): Promise<PaymentIntent>;

  createPayment(
    payment: PaymentUpdateModel,
    source: EventSource,
  ): Promise<Payment>;

  getPayment(id: string): Promise<Payment | null>;
  getPaymentByExternalId(externalId: string): Promise<Payment | null>;
  getAppointmentPayments(appointmentId: string): Promise<Payment[]>;

  updatePayment(
    id: string,
    update: Partial<PaymentUpdateModel>,
    source: EventSource,
  ): Promise<Payment>;

  deletePayment(id: string, source: EventSource): Promise<Payment | null>;

  refundPayment(
    id: string,
    amount: number,
    source: EventSource,
  ): Promise<
    | { success: false; error: string; status: number }
    | { success: true; updatedPayment: Payment }
  >;
}
