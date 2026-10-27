import type { DailyRecord } from "../api";
import { compareDisplayDates } from "./date";
import { findRecord } from "./records";

export type DateEntryStatus = "saved" | "missing" | "today" | "upcoming";

export type DateEntry = {
  date: string;
  record: DailyRecord | null;
  status: DateEntryStatus;
  isToday: boolean;
};

export type Completion = {
  entered: number;
  total: number;
  percent: number;
};

export type MissingSummary = {
  missing: number;
  today: number;
  upcoming: number;
};

export const buildDateEntries = (dates: string[], records: DailyRecord[], today: string): DateEntry[] => dates.map((date) => {
  const record = findRecord(records, date);
  const isToday = date === today;
  const status: DateEntryStatus = record ? "saved" : isToday ? "today" : compareDisplayDates(date, today) < 0 ? "missing" : "upcoming";
  return { date, record, status, isToday };
});

export const completionFor = (entries: DateEntry[]): Completion => {
  const total = entries.length;
  const entered = entries.filter((entry) => entry.status === "saved").length;
  return { entered, total, percent: total ? (entered / total) * 100 : 0 };
};

export const missingSummaryFor = (entries: DateEntry[]): MissingSummary => ({
  missing: entries.filter((entry) => entry.status === "missing").length,
  today: entries.filter((entry) => entry.status === "today").length,
  upcoming: entries.filter((entry) => entry.status === "upcoming").length
});

export const nextActionFor = (entries: DateEntry[]) => entries.find((entry) => entry.status === "missing")
  ?? entries.find((entry) => entry.status === "today")
  ?? null;

export const nextMissingFor = (entries: DateEntry[]) => entries.find((entry) => entry.status === "missing" || entry.status === "today") ?? null;

export const entriesNeedingAttention = (entries: DateEntry[]) => entries.filter((entry) => entry.status === "missing" || entry.status === "today");

export const sortRecords = (records: DailyRecord[]) => [...records].sort((left, right) => compareDisplayDates(left.workDate, right.workDate));

export const savedEntries = (entries: DateEntry[]) => entries.filter((entry) => entry.record !== null);
