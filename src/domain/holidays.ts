import type { Holiday, HolidayCalendar, HolidayClassification } from "../api";
import { displayToIso } from "./date";

export const holidaysForDate = (calendar: HolidayCalendar | undefined, date: string): Holiday[] => {
  const isoDate = displayToIso(date);
  return calendar?.holidays.filter((holiday) => holiday.date === isoDate) ?? [];
};

export const nonWorkingHolidayForDate = (calendar: HolidayCalendar | undefined, date: string): Holiday | null =>
  holidaysForDate(calendar, date).find((holiday) => holiday.isNonWorking) ?? null;

export const holidayCoverageYears = (calendar: HolidayCalendar | undefined): number[] =>
  calendar?.years.filter((year) => year.status !== "REVIEWED").map((year) => year.year) ?? [];

const classifications = new Set<HolidayClassification>(["REGULAR", "SPECIAL_NON_WORKING", "SPECIAL_WORKING"]);

export const holidayConflictFromFields = (fields: unknown): { calendarVersion: string; holidays: Holiday[] } | null => {
  if (!fields || typeof fields !== "object") return null;
  const value = fields as { calendarVersion?: unknown; holidays?: unknown };
  if (typeof value.calendarVersion !== "string" || !Array.isArray(value.holidays)) return null;
  const holidays = value.holidays.filter((holiday): holiday is Holiday => {
    if (!holiday || typeof holiday !== "object") return false;
    const item = holiday as Partial<Holiday>;
    return typeof item.date === "string"
      && typeof item.name === "string"
      && typeof item.classification === "string"
      && classifications.has(item.classification as HolidayClassification)
      && typeof item.isNonWorking === "boolean"
      && (item.source === "OFFICIAL_PROCLAMATION" || item.source === "DATE_HOLIDAYS")
      && typeof item.sourceUrl === "string";
  });
  return holidays.length ? { calendarVersion: value.calendarVersion, holidays } : null;
};
