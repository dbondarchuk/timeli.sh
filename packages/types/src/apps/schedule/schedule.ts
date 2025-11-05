import { DaySchedule } from "../../configuration";
import { ConnectedAppData } from "../connected-app.data";

export interface IScheduleProvider {
  getSchedule(
    appData: ConnectedAppData,
    start: Date,
    end: Date,
  ): Promise<Record<string, DaySchedule>>;
}
