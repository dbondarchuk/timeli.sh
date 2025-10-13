import { Payment, PaymentUpdateModel } from "../../booking";
import { ConnectedAppData } from "../connected-app.data";

export interface IPaymentHook {
  onPaymentCreated?: (
    appData: ConnectedAppData,
    payment: Payment,
  ) => Promise<void>;

  onPaymentUpdated?: (
    appData: ConnectedAppData,
    payment: Payment,
    update: Partial<PaymentUpdateModel>,
  ) => Promise<void>;

  onPaymentDeleted?: (
    appData: ConnectedAppData,
    payment: Payment,
  ) => Promise<void>;

  onPaymentRefunded?: (
    appData: ConnectedAppData,
    payment: Payment,
    refundAmount: number,
  ) => Promise<void>;
}
