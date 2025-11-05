import {
  AppointmentEvent,
  AppointmentOnlineMeetingInformation,
} from "../../booking";
import { WithDatabaseId } from "../../database";
import { ConnectedAppData } from "../connected-app.data";

export interface IMeetingUrlProvider {
  getMeetingUrl(
    app: ConnectedAppData,
    appointment: WithDatabaseId<AppointmentEvent>,
  ): Promise<AppointmentOnlineMeetingInformation>;
}
