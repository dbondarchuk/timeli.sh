import {
  AppointmentOption,
  AppointmentOptionUpdateModel,
} from "../../booking/appointment-option";
import { ConnectedAppData } from "../connected-app.data";

export interface IServiceHook {
  onServiceCreated?: (
    appData: ConnectedAppData,
    service: AppointmentOption,
  ) => Promise<void>;
  onServiceUpdated?: (
    appData: ConnectedAppData,
    service: AppointmentOption,
    update: Partial<AppointmentOptionUpdateModel>,
  ) => Promise<void>;
  onServicesDeleted?: (
    appData: ConnectedAppData,
    servicesIds: string[],
  ) => Promise<void>;
}
