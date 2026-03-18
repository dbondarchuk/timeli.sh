import { ServiceField, ServiceFieldUpdateModel } from "../../booking/field";
import { ConnectedAppData } from "../connected-app.data";

export interface IFieldHook {
  onFieldCreated?: (
    appData: ConnectedAppData,
    field: ServiceField,
  ) => Promise<void>;
  onFieldUpdated?: (
    appData: ConnectedAppData,
    field: ServiceField,
    update: Partial<ServiceFieldUpdateModel>,
  ) => Promise<void>;
  onFieldsDeleted?: (
    appData: ConnectedAppData,
    fieldsIds: string[],
  ) => Promise<void>;
}
