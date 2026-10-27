import { describe, expect, it } from "vitest";
import type { DailyRecord } from "../api";
import { buildDateEntries, completionFor, missingSummaryFor, nextActionFor, nextMissingFor, sortRecords } from "./period";

const record = (workDate: string, overrides: Partial<DailyRecord> = {}): DailyRecord => ({
  id: `record-${workDate}`,
  workDate,
  dayType: "WORKDAY",
  clockInMinute: 480,
  clockOutMinute: 1020,
  endsNextDay: false,
  breakMinutes: 60,
  calculationMode: "AUTO",
  regularMinutes: 480,
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
  tasks: [],
  ...overrides
});

const dates = ["10/25/2026", "10/26/2026", "10/27/2026", "10/28/2026", "10/29/2026"];
const today = "10/27/2026";

describe("period progress helpers", () => {
  it("classifies saved, missing, today, and upcoming dates", () => {
    const entries = buildDateEntries(dates, [record("10/25/2026"), record("10/26/2026", { dayType: "REST_DAY", regularMinutes: 0 })], today);
    expect(entries.map((entry) => entry.status)).toEqual(["saved", "saved", "today", "upcoming", "upcoming"]);
    expect(entries[1].record?.dayType).toBe("REST_DAY");
  });

  it("counts a saved rest day with zero hours as complete", () => {
    const entries = buildDateEntries(dates, [record("10/25/2026", { dayType: "REST_DAY", regularMinutes: 0, clockInMinute: null, clockOutMinute: null })], today);
    expect(completionFor(entries)).toEqual({ entered: 1, total: 5, percent: 20 });
  });

  it("summarises missing versus upcoming dates", () => {
    const summary = missingSummaryFor(buildDateEntries(dates, [record("10/27/2026")], today));
    expect(summary).toEqual({ missing: 2, today: 0, upcoming: 2 });
  });

  it("prioritises the earliest past missing date, then today", () => {
    expect(nextActionFor(buildDateEntries(dates, [], today))?.date).toBe("10/25/2026");
    expect(nextActionFor(buildDateEntries(dates, [record("10/25/2026"), record("10/26/2026")], today))?.date).toBe("10/27/2026");
    expect(nextActionFor(buildDateEntries(dates, dates.map((date) => record(date)), today))).toBeNull();
    expect(nextMissingFor(buildDateEntries(dates, dates.map((date) => record(date)), today))).toBeNull();
  });

  it("does not treat future dates as overdue", () => {
    const entries = buildDateEntries(dates, [record("10/27/2026")], today);
    expect(entries.find((entry) => entry.date === "10/28/2026")?.status).toBe("upcoming");
    expect(nextActionFor(entries)?.date).toBe("10/25/2026");
  });

  it("sorts saved records by real date order", () => {
    const sorted = sortRecords([record("11/01/2026"), record("10/09/2026"), record("10/31/2026")]);
    expect(sorted.map((item) => item.workDate)).toEqual(["10/09/2026", "10/31/2026", "11/01/2026"]);
  });
});
