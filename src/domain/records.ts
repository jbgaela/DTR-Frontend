import type { DailyRecord, DayType, Profile } from "../api";
import { formatDateInput, isWeekend, parseDateInput } from "./date";

export const dateRange = (start: string, end: string) => {
  const result: string[] = [];
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  if (!startDate || !endDate || startDate > endDate) return result;
  for (let value = new Date(startDate.getTime()); value <= endDate; value.setUTCDate(value.getUTCDate() + 1)) result.push(formatDateInput(value));
  return result;
};

export const defaultDayType = (date: string): DayType => isWeekend(date) ? "REST_DAY" : "WORKDAY";

export const blankRecord = (date: string, profile: Profile): Omit<DailyRecord, "id"> => ({
  workDate: date,
  dayType: defaultDayType(date),
  clockInMinute: null,
  clockOutMinute: null,
  endsNextDay: false,
  breakMinutes: defaultDayType(date) === "WORKDAY" ? profile.standardBreakMinutes : 0,
  calculationMode: "AUTO",
  regularMinutes: 0,
  nightDiffMinutes: 0,
  regularOtMinutes: 0,
  nightDiffOtMinutes: 0,
  restDayMinutes: 0,
  restDayOtMinutes: 0,
  holidayMinutes: 0,
  activity: "",
  accomplishmentType: "",
  accomplishmentStatus: "",
  hoursSpentMinutes: 0,
  remarks: "",
  tasks: []
});
