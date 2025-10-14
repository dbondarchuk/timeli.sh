import { DateTime } from "luxon";
import { WaitlistDate, WaitlistTime, waitlistTime } from "./waitlist";

export const waitlistTimeSort = (a: WaitlistTime, b: WaitlistTime) =>
  waitlistTime.indexOf(a) - waitlistTime.indexOf(b);

export interface WaitlistDateGroup {
  id: string;
  dates: WaitlistDate[];
  times: WaitlistTime[];
  startDate: string;
  endDate: string;
  isSequential: boolean;
}

export const groupWaitlistDates = (
  dates: WaitlistDate[],
): WaitlistDateGroup[] => {
  if (dates.length === 0) return [];

  // Sort dates by date
  const sortedDates = [...dates].sort((a, b) => a.date.localeCompare(b.date));

  const groups: WaitlistDateGroup[] = [];
  let currentGroup: WaitlistDate[] = [];
  let currentTimes: WaitlistTime[] = [];

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const timesString = [...date.time].sort(waitlistTimeSort).join(",");

    // Check if this date can be added to current group
    const canAddToGroup =
      currentGroup.length === 0 ||
      (timesString === currentTimes.sort(waitlistTimeSort).join(",") &&
        isSequentialDate(
          currentGroup[currentGroup.length - 1].date,
          date.date,
        ));

    if (canAddToGroup) {
      currentGroup.push(date);
      if (currentTimes.length === 0) {
        currentTimes = [...date.time];
      }
    } else {
      // Finalize current group
      if (currentGroup.length > 0) {
        groups.push(createGroup(currentGroup, currentTimes));
      }

      // Start new group
      currentGroup = [date];
      currentTimes = [...date.time];
    }
  }

  // Add the last group
  if (currentGroup.length > 0) {
    groups.push(createGroup(currentGroup, currentTimes));
  }

  return groups;
};

const isSequentialDate = (date1: string, date2: string): boolean => {
  const d1 = DateTime.fromISO(date1);
  const d2 = DateTime.fromISO(date2);
  return d2.diff(d1, "days").days === 1;
};

const createGroup = (
  dates: WaitlistDate[],
  times: WaitlistTime[],
): WaitlistDateGroup => {
  const sortedDates = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const startDate = sortedDates[0].date;
  const endDate = sortedDates[sortedDates.length - 1].date;

  return {
    id: `${startDate}-${endDate}-${times.join(",")}`,
    dates: sortedDates,
    times: [...times].sort(waitlistTimeSort),
    startDate,
    endDate,
    isSequential:
      sortedDates.length > 1 &&
      sortedDates.every(
        (date, index) =>
          index === 0 ||
          isSequentialDate(sortedDates[index - 1].date, date.date),
      ),
  };
};
