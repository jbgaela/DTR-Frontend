import type { DailyHoursPreviewInput, DailyRecord, DailyRecordInput, DayType, Profile } from "../api";
import { shiftDefaults, type DailyRecordValue } from "./records";

export type OverrideKey = "regularMinutes" | "nightDiffMinutes" | "regularOtMinutes" | "nightDiffOtMinutes" | "restDayMinutes" | "restDayOtMinutes" | "holidayMinutes";
export type OverrideMap = Record<OverrideKey, number>;

export type DailyForm = {
  dayType: DayType;
  clockInMinute: number | null;
  clockOutMinute: number | null;
  endsNextDay: boolean;
  breakMinutes: number;
  calculationMode: "AUTO" | "OVERRIDE";
  override: OverrideMap;
  activity: string;
  accomplishmentType: string;
  accomplishmentStatus: string;
  hoursSpentMinutes: number;
  remarks: string;
  tasksText: string;
};

export const zeroOverride = (): OverrideMap => ({
  regularMinutes: 0,
  nightDiffMinutes: 0,
  regularOtMinutes: 0,
  nightDiffOtMinutes: 0,
  restDayMinutes: 0,
  restDayOtMinutes: 0,
  holidayMinutes: 0
});

export const toOverride = (record: DailyRecordValue): OverrideMap => ({
  regularMinutes: record.regularMinutes,
  nightDiffMinutes: record.nightDiffMinutes,
  regularOtMinutes: record.regularOtMinutes,
  nightDiffOtMinutes: record.nightDiffOtMinutes,
  restDayMinutes: record.restDayMinutes,
  restDayOtMinutes: record.restDayOtMinutes,
  holidayMinutes: record.holidayMinutes
});

export const toDailyForm = (record: DailyRecordValue): DailyForm => ({
  dayType: record.dayType,
  clockInMinute: record.clockInMinute,
  clockOutMinute: record.clockOutMinute,
  endsNextDay: record.endsNextDay,
  breakMinutes: record.breakMinutes,
  calculationMode: record.calculationMode,
  override: toOverride(record),
  activity: record.activity,
  accomplishmentType: record.accomplishmentType,
  accomplishmentStatus: record.accomplishmentStatus,
  hoursSpentMinutes: record.hoursSpentMinutes,
  remarks: record.remarks,
  tasksText: record.tasks.map((task) => task.text).join("\n")
});

export const dailyPayload = (form: DailyForm): DailyRecordInput => ({
  dayType: form.dayType,
  clockInMinute: form.clockInMinute,
  clockOutMinute: form.clockOutMinute,
  endsNextDay: form.endsNextDay,
  breakMinutes: form.breakMinutes,
  calculationMode: form.calculationMode,
  override: form.calculationMode === "OVERRIDE" ? form.override : undefined,
  activity: form.activity.trim(),
  accomplishmentType: form.accomplishmentType.trim(),
  accomplishmentStatus: form.accomplishmentStatus.trim(),
  hoursSpentMinutes: form.hoursSpentMinutes,
  remarks: form.remarks,
  tasks: form.tasksText.split("\n").map((task) => task.trim()).filter(Boolean)
});

export const dailyPreviewInput = (form: DailyForm): DailyHoursPreviewInput => ({
  dayType: form.dayType,
  clockInMinute: form.clockInMinute,
  clockOutMinute: form.clockOutMinute,
  endsNextDay: form.endsNextDay,
  breakMinutes: form.breakMinutes,
  calculationMode: form.calculationMode,
  override: form.calculationMode === "OVERRIDE" ? form.override : undefined
});

export const dailyFormSignature = (form: DailyForm) => JSON.stringify({ ...form, override: form.calculationMode === "OVERRIDE" ? form.override : undefined });

export const applyShiftFallback = (form: DailyForm, profile: Profile): DailyForm => {
  if (form.dayType !== "WORKDAY" || form.clockInMinute !== null || form.clockOutMinute !== null) return form;
  return { ...form, ...shiftDefaults(profile) };
};

export const hasShiftFallback = (form: DailyForm) => form.dayType === "WORKDAY" && form.clockInMinute === null && form.clockOutMinute === null;

export const taskLines = (text: string) => text.split("\n").map((task) => task.trim()).filter(Boolean);

export const overrideFields: Array<{ key: OverrideKey; label: string; hint: string }> = [
  { key: "regularMinutes", label: "Regular hours", hint: "Ordinary workday time." },
  { key: "regularOtMinutes", label: "Overtime", hint: "Day overtime, excluding night OT." },
  { key: "nightDiffMinutes", label: "Night differential", hint: "Night work inside regular hours." },
  { key: "nightDiffOtMinutes", label: "Night OT", hint: "Night work beyond the shift." },
  { key: "restDayMinutes", label: "Rest-day hours", hint: "First 8 hours on a rest day." },
  { key: "restDayOtMinutes", label: "Rest-day OT", hint: "Hours beyond 8 on a rest day." },
  { key: "holidayMinutes", label: "Holiday hours", hint: "Worked holiday time." }
];

export const recordStatus = (record: DailyRecordValue): "saved" | "new" => "id" in record ? "saved" : "new";
