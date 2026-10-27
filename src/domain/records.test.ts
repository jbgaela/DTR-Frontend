import { describe, expect, it } from "vitest";
import type { DailyRecord, Profile } from "../api";
import { blankRecord, dateRange, defaultDayType, findRecord, sumRecords, toHours } from "./records";

const profile: Profile = {
  employeeName: "Demo Employee",
  employeeId: "DEMO-0001",
  position: "Software Engineer",
  projectAssignment: "Demo",
  validatorName: "Validator",
  supervisorName: "Supervisor",
  shiftStartMinute: 480,
  shiftEndMinute: 1020,
  standardBreakMinutes: 60,
  regularLimitMinutes: 480,
  nightStartMinute: 1320,
  nightEndMinute: 360,
  workdayMask: 62,
  timezone: "Asia/Manila"
};

const record = (overrides: Partial<DailyRecord>): DailyRecord => ({
  id: "record-1",
  workDate: "10/16/2026",
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
  accomplishmentType: "Feature",
  accomplishmentStatus: "Completed",
  hoursSpentMinutes: 480,
  remarks: "",
  tasks: [],
  ...overrides
});

describe("record helpers", () => {
  it("creates a blank workday with the shift times and profile break", () => {
    const blank = blankRecord("10/27/2026", profile);
    expect(blank.dayType).toBe("WORKDAY");
    expect(blank.breakMinutes).toBe(60);
    expect(blank.clockInMinute).toBe(480);
    expect(blank.clockOutMinute).toBe(1020);
    expect(blank.endsNextDay).toBe(false);
    expect(blank.calculationMode).toBe("AUTO");
    expect(blank.tasks).toEqual([]);
  });

  it("sets an overnight flag when the shift crosses midnight", () => {
    const overnight = blankRecord("10/27/2026", { ...profile, shiftStartMinute: 1320, shiftEndMinute: 360 });
    expect(overnight.clockInMinute).toBe(1320);
    expect(overnight.clockOutMinute).toBe(360);
    expect(overnight.endsNextDay).toBe(true);
  });

  it("keeps rest-day drafts empty until work is entered", () => {
    const restDay = blankRecord("10/24/2026", profile);
    expect(restDay.dayType).toBe("REST_DAY");
    expect(restDay.clockInMinute).toBeNull();
    expect(restDay.clockOutMinute).toBeNull();
    expect(restDay.breakMinutes).toBe(0);
  });

  it("defaults Saturdays and Sundays to rest days", () => {
    expect(defaultDayType("10/24/2026")).toBe("REST_DAY");
    expect(defaultDayType("10/25/2026")).toBe("REST_DAY");
    expect(defaultDayType("10/26/2026")).toBe("WORKDAY");
  });

  it("creates date ranges and finds records", () => {
    expect(dateRange("10/16/2026", "10/18/2026")).toEqual(["10/16/2026", "10/17/2026", "10/18/2026"]);
    const list = [record({ id: "a", workDate: "10/16/2026" }), record({ id: "b", workDate: "10/17/2026", dayType: "REST_DAY" })];
    expect(findRecord(list, "10/17/2026")?.id).toBe("b");
    expect(findRecord(list, "10/18/2026")).toBeNull();
  });

  it("keeps authoritative hour categories separate", () => {
    const totals = sumRecords([
      record({ regularMinutes: 480, regularOtMinutes: 60, nightDiffMinutes: 30, nightDiffOtMinutes: 45, restDayMinutes: 120, restDayOtMinutes: 45, holidayMinutes: 8 }),
      record({ id: "record-2", regularMinutes: 60, regularOtMinutes: 15 })
    ]);
    expect(totals).toEqual({
      regularMinutes: 540,
      overtimeMinutes: 75,
      nightDiffMinutes: 30,
      nightOtMinutes: 45,
      restDayMinutes: 120,
      restDayOtMinutes: 45,
      holidayMinutes: 8
    });
  });

  it("copies only the calculated hour buckets", () => {
    const hours = toHours(record({ regularMinutes: 480, nightDiffOtMinutes: 60 }));
    expect(hours).toEqual({
      regularMinutes: 480,
      nightDiffMinutes: 0,
      regularOtMinutes: 0,
      nightDiffOtMinutes: 60,
      restDayMinutes: 0,
      restDayOtMinutes: 0,
      holidayMinutes: 0
    });
  });
});
