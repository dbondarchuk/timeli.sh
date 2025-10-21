import type { DaySchedule, HourNumbers } from "@vivid/types";
import type { ReactNode } from "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type CalendarEventVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive";

export type CalendarEvent = {
  id?: string;
  start: Date;
  end: Date;
  title: string;
  variant?: CalendarEventVariant;
};

type BaseEventCalendarProps = {
  date?: Date;
  events?: CalendarEvent[];
  className?: string;
  disableTimeChange?: boolean;
  schedule?: Record<string, DaySchedule>;
  onRangeChange?: (start: Date, end: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
};

type BaseWeeklyEventCalendarProps = BaseEventCalendarProps & {
  scrollToHour?: HourNumbers;
  slotInterval?: 5 | 10 | 15 | 20 | 30;
};

type WeekOfEventCalendarProps = BaseWeeklyEventCalendarProps;

type DaysAroundCalendarProps = BaseWeeklyEventCalendarProps & {
  daysAround?: number;
};

export type WeeklyEventCalendarProps =
  | (WeekOfEventCalendarProps & {
      variant: "week-of";
    })
  | (DaysAroundCalendarProps & {
      variant: "days-around";
    });

export type DailyEventCalendarProps = BaseWeeklyEventCalendarProps;

export type MonthlyEventCalendarProps = BaseEventCalendarProps & {
  onDateClick?: (date: Date) => void;
};

export type AgendaEventCalendarProps = BaseEventCalendarProps & {
  daysToShow?: number;
  renderEvent?: (event: CalendarEvent) => ReactNode;
};

export type EventCalendarProps =
  | (WeekOfEventCalendarProps & {
      type: "weekly";
    })
  | (DaysAroundCalendarProps & {
      type: "days-around";
    })
  | (MonthlyEventCalendarProps & {
      type: "monthly";
    })
  | (DailyEventCalendarProps & {
      type: "daily";
    })
  | (AgendaEventCalendarProps & {
      type: "agenda";
    });

export type EventCalendarType = EventCalendarProps["type"];
