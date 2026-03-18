import {
  AppointmentAddon,
  AppointmentAddonUpdateModel,
} from "../../booking/appointment-option";
import { ConnectedAppData } from "../connected-app.data";

export interface IAddonHook {
  onAddonCreated?: (
    appData: ConnectedAppData,
    addon: AppointmentAddon,
  ) => Promise<void>;
  onAddonUpdated?: (
    appData: ConnectedAppData,
    addon: AppointmentAddon,
    update: Partial<AppointmentAddonUpdateModel>,
  ) => Promise<void>;
  onAddonsDeleted?: (
    appData: ConnectedAppData,
    addonsIds: string[],
  ) => Promise<void>;
}
