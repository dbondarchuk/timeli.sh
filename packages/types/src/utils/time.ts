import { HourNumbers, MinuteNumbers, Time } from "../booking/date-time";

export const parseTime = (time: string): Time => {
  const parts = time?.split(":");
  if (parts?.length !== 2) throw new Error(`Wrong time format: ${time}`);

  return {
    hour: parseInt(parts[0], 10) as HourNumbers,
    minute: parseInt(parts[1], 10) as MinuteNumbers,
  };
};
