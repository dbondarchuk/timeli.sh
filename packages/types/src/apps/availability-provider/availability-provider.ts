import { DaySchedule, Period, TimeSlot } from "../..";
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
