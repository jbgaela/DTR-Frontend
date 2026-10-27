import { describe, expect, it } from "vitest";
import { currentSemiMonthlyRange, daysBetween, displayToIso, eachDateInRange, formatRangeLabel, isValidRange, isoToDisplay, parseDateInput, periodKindLabel, shiftSemiMonthlyRange, todayInTimezone } from "./date";

describe("date helpers", () => {
  it("parses display dates and rejects impossible dates", () => {
    expect(parseDateInput("10/27/2026")?.toISOString()).toBe("2026-10-27T00:00:00.000Z");
    expect(parseDateInput("02/29/2024")).not.toBeNull();
    expect(parseDateInput("02/29/2026")).toBeNull();
    expect(parseDateInput("13/01/2026")).toBeNull();
    expect(parseDateInput("2026-10-27")).toBeNull();
  });

  it("converts between display and URL-safe formats without shifting the date", () => {
    expect(displayToIso("10/27/2026")).toBe("2026-10-27");
    expect(isoToDisplay("2026-10-27")).toBe("10/27/2026");
    expect(displayToIso("not a date")).toBe("");
    expect(isoToDisplay("2026-02-30")).toBe("");
  });

  it("uses the profile timezone for today", () => {
    expect(todayInTimezone("Asia/Manila", new Date("2026-10-26T16:30:00.000Z"))).toBe("10/27/2026");
    expect(todayInTimezone("Asia/Manila", new Date("2026-10-26T15:30:00.000Z"))).toBe("10/26/2026");
  });

  it("computes the current semi-monthly range", () => {
    expect(currentSemiMonthlyRange(new Date(2026, 9, 1, 12))).toEqual({ startDate: "10/01/2026", endDate: "10/15/2026" });
    expect(currentSemiMonthlyRange(new Date(2026, 9, 27, 12))).toEqual({ startDate: "10/16/2026", endDate: "10/31/2026" });
    expect(currentSemiMonthlyRange(new Date(2026, 1, 28, 12))).toEqual({ startDate: "02/16/2026", endDate: "02/28/2026" });
    expect(currentSemiMonthlyRange(new Date(2024, 1, 28, 12))).toEqual({ startDate: "02/16/2024", endDate: "02/29/2024" });
  });

  it("shifts cutoff ranges across month and year boundaries", () => {
    expect(shiftSemiMonthlyRange({ startDate: "10/16/2026", endDate: "10/31/2026" }, -1)).toEqual({ startDate: "10/01/2026", endDate: "10/15/2026" });
    expect(shiftSemiMonthlyRange({ startDate: "10/01/2026", endDate: "10/15/2026" }, -1)).toEqual({ startDate: "09/16/2026", endDate: "09/30/2026" });
    expect(shiftSemiMonthlyRange({ startDate: "01/01/2026", endDate: "01/15/2026" }, -1)).toEqual({ startDate: "12/16/2025", endDate: "12/31/2025" });
    expect(shiftSemiMonthlyRange({ startDate: "12/16/2026", endDate: "12/31/2026" }, 1)).toEqual({ startDate: "01/01/2027", endDate: "01/15/2027" });
  });

  it("builds inclusive date ranges, including leap days", () => {
    expect(eachDateInRange("02/27/2024", "03/01/2024")).toEqual(["02/27/2024", "02/28/2024", "02/29/2024", "03/01/2024"]);
    expect(eachDateInRange("10/31/2026", "10/01/2026")).toEqual([]);
    expect(daysBetween("10/16/2026", "10/31/2026")).toBe(16);
  });

  it("formats period labels and identifies standard cutoffs", () => {
    expect(formatRangeLabel("10/16/2026", "10/31/2026")).toBe("Oct 16 – 31, 2026");
    expect(formatRangeLabel("10/16/2026", "11/15/2026")).toBe("Oct 16 – Nov 15, 2026");
    expect(formatRangeLabel("12/16/2025", "01/15/2026")).toBe("Dec 16, 2025 – Jan 15, 2026");
    expect(periodKindLabel("10/01/2026", "10/15/2026")).toBe("First half");
    expect(periodKindLabel("10/16/2026", "10/31/2026")).toBe("Second half");
    expect(periodKindLabel("10/20/2026", "10/25/2026")).toBe("Custom range");
  });

  it("validates ranges", () => {
    expect(isValidRange("10/01/2026", "10/15/2026")).toBe(true);
    expect(isValidRange("10/16/2026", "10/15/2026")).toBe(false);
    expect(isValidRange("", "10/15/2026")).toBe(false);
  });
});
