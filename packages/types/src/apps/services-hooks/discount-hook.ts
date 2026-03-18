import { Discount, DiscountUpdateModel } from "../../booking/discount";
import { Customer } from "../../customers/customer";
import { ConnectedAppData } from "../connected-app.data";

export interface IDiscountHook {
  onDiscountCreated?: (
    appData: ConnectedAppData,
    discount: Discount,
  ) => Promise<void>;
  onDiscountUpdated?: (
    appData: ConnectedAppData,
    discount: Discount,
    update: Partial<DiscountUpdateModel>,
  ) => Promise<void>;
  onDiscountsDeleted?: (
    appData: ConnectedAppData,
    discountsIds: string[],
  ) => Promise<void>;
  onDiscountApplied?: (
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
  ) => Promise<void>;
}
