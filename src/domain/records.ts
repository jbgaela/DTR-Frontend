import type { DailyHours, DailyRecord, DayType, Profile } from "../api";
import { eachDateInRange, isWeekend } from "./date";

export type DailyRecordValue = Omit<DailyRecord, "id"> | DailyRecord;
export type HourTotals = {
  regularMinutes: number;
  overtimeMinutes: number;
  nightDiffMinutes: number;
  nightOtMinutes: number;
  restDayMinutes: number;
  restDayOtMinutes: number;
  holidayMinutes: number;
};

export const emptyTotals = (): HourTotals => ({
  regularMinutes: 0,
  overtimeMinutes: 0,
  nightDiffMinutes: 0,
  nightOtMinutes: 0,
  restDayMinutes: 0,
  restDayOtMinutes: 0,
  holidayMinutes: 0
});

export const dateRange = (start: string, end: string) => eachDateInRange(start, end);

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
  activity: "API Development",
  accomplishmentType: "",
  accomplishmentStatus: "",
  hoursSpentMinutes: 0,
  remarks: "",
  tasks: []
});

export const toHours = (record: DailyRecordValue): DailyHours => ({
  regularMinutes: record.regularMinutes,
  nightDiffMinutes: record.nightDiffMinutes,
  regularOtMinutes: record.regularOtMinutes,
  nightDiffOtMinutes: record.nightDiffOtMinutes,
  restDayMinutes: record.restDayMinutes,
  restDayOtMinutes: record.restDayOtMinutes,
  holidayMinutes: record.holidayMinutes
});

export const sumRecords = (records: DailyRecord[]): HourTotals => records.reduce((total, record) => ({
  regularMinutes: total.regularMinutes + record.regularMinutes,
  overtimeMinutes: total.overtimeMinutes + record.regularOtMinutes,
  nightDiffMinutes: total.nightDiffMinutes + record.nightDiffMinutes,
  nightOtMinutes: total.nightOtMinutes + record.nightDiffOtMinutes,
  restDayMinutes: total.restDayMinutes + record.restDayMinutes,
  restDayOtMinutes: total.restDayOtMinutes + record.restDayOtMinutes,
  holidayMinutes: total.holidayMinutes + record.holidayMinutes
}), emptyTotals());

export const findRecord = (records: DailyRecord[], date: string) => records.find((record) => record.workDate === date) ?? null;
