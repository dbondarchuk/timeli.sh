import { Period } from "../../booking/period";
import { TimeSlot } from "../../booking/time-slot";
import { DaySchedule } from "../../configuration/schedule";
import { ConnectedAppData } from "../connected-app.data";

export interface IAvailabilityProvider {
  getAvailability(
    appData: ConnectedAppData,
    start: Date,
    end: Date,
    duration: number,
    events: Period[],
    schedule: Record<string, DaySchedule>,
  ): Promise<TimeSlot[]>;
}
