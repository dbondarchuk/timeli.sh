import { Customer, CustomerUpdateModel } from "../../customers";
import { ConnectedAppData } from "../connected-app.data";

export interface ICustomerHook {
  onCustomerCreated?: (
    appData: ConnectedAppData,
    customer: Customer,
  ) => Promise<void>;

  onCustomerUpdated?: (
    appData: ConnectedAppData,
    customer: Customer,
    update: CustomerUpdateModel,
  ) => Promise<void>;

  onCustomersDeleted?: (
    appData: ConnectedAppData,
    customers: Customer[],
  ) => Promise<void>;
}
