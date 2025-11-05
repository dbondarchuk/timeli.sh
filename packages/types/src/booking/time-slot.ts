import { Time } from "./date-time";

export interface PeriodMoment {
  /** The year of the moment. */
  year?: number;
  /** The month of the moment. */
  month: number;
  /** The day of the year of the moment. */
  day: number;
  /** The hour of the moment. */
  hour?: number;
  /** The minute of the moment. */
  minute?: number;
}

export interface TimeSlotPeriod {
  /** The moment the shift starts. When no year specified the shift repeats every year. */
  startAt: PeriodMoment;
  /** The moment the shift end. If year defined for `startAt`, it must be defined for `endAt`. */
  endAt: PeriodMoment;
}

export interface Shift {
  /** A start time in the `HH:mm` format. */
  start: string;
  /** An end time in the `HH:mm` format. */
  end: string;
}

export interface AvailablePeriod {
  /** An ISO weekday (1 for Monday to 7 for Sunday). */
  weekDay: number;
  /** A list of shifts for the day. */
  shifts: Shift[];
}

export interface TimeSlotsFinderConfiguration {
  /** Duration of a appointment in minutes. */
  timeSlotDuration: number;
  /** The periods where booking is possible in a week. */
  schedule: Record<string, Shift[]>;
  /**
   * A number indicating the step for the start minute of a slot.
   * E.g. if the multiple is 15, slots can only begin at XX:00, XX:15, XX:30 or XX:45.
   * Default value is 5.
   */
  slotStart?: 5 | 10 | 15 | 20 | 30 | "every-hour" | "custom";
  /** Custom time slots */
  customSlots?: Time[];
  /** Periods where booking is impossible. Take precedence over workedPeriods. */
  unavailablePeriods?: TimeSlotPeriod[];
  /** The minimum amount of minutes available before an appointment. */
  minAvailableTimeBeforeSlot?: number;
  /** The minimum amount of minutes available after an appointment. */
  minAvailableTimeAfterSlot?: number;
  /** The minimum amount of minutes between the time of the booking and the appointment booked. */
  minTimeBeforeFirstSlot?: number;
  /** The maximum days in the future before appointments cannot be taken anymore. */
  maxDaysBeforeLastSlot?: number;
  /** The time zone used through all the configuration. */
  timeZone: string;
}

export interface DatePeriod {
  startAt: Date;
  endAt: Date;
}

export interface TimeSlot extends DatePeriod {
  duration: number;
}

export class TimeSlotsFinderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeSlotsFinderError";
  }
}
