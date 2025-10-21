import { CalendarEventVariant } from "./types";

export const EventVariantClasses: Record<CalendarEventVariant, string> = {
  primary: "bg-slate-800 text-white hover:bg-indigo-900",
  secondary: "bg-slate-400 hover:bg-indigo-500",
  tertiary: "bg-slate-600 text-white hover:bg-indigo-300",
  destructive: "bg-red-800 text-white hover:bg-red-900",
};
