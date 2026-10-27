import { describe, expect, it } from "vitest";
import type { DailyRecord } from "../api";
import { dailyFormSignature, dailyPayload, dailyPreviewInput, toDailyForm, zeroOverride } from "./daily";
import { validateDaily, validateLeave, validateProfile } from "./validation";

const record: DailyRecord = {
  id: "record-1",
  workDate: "10/16/2026",
  dayType: "WORKDAY",
  clockInMinute: 480,
  clockOutMinute: 1020,
  endsNextDay: false,
  breakMinutes: 60,
  calculationMode: "AUTO",
  regularMinutes: 480,
  nightDiffMinutes: 10,
  regularOtMinutes: 20,
  nightDiffOtMinutes: 30,
  restDayMinutes: 0,
  restDayOtMinutes: 0,
  holidayMinutes: 0,
  activity: "API Development",
  accomplishmentType: "Feature",
  accomplishmentStatus: "Completed",
  hoursSpentMinutes: 480,
  remarks: "Notes",
  tasks: [{ id: "task-1", position: 0, text: "First task" }, { id: "task-2", position: 1, text: "Second task" }]
};

const profile = {
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

const leave = { dateFiled: "2026-10-20", leaveType: "VACATION" as const, fromDate: "2026-10-29", toDate: "2026-10-30", numberOfDays: 2, reason: "Family trip" };

describe("daily form helpers", () => {
  it("round-trips a record into editable form state", () => {
    const form = toDailyForm(record);
    expect(form.tasksText).toBe("First task\nSecond task");
    expect(form.override.regularMinutes).toBe(480);
    expect(form.override.nightDiffOtMinutes).toBe(30);
  });

  it("builds a trimmed task array and omits unused overrides", () => {
    const form = { ...toDailyForm(record), tasksText: " First task \n\n Second task \n", activity: "  API Development  " };
    const payload = dailyPayload(form);
    expect(payload.tasks).toEqual(["First task", "Second task"]);
    expect(payload.activity).toBe("API Development");
    expect(payload.override).toBeUndefined();
  });

  it("sends overrides only in manual mode", () => {
    const form = { ...toDailyForm(record), calculationMode: "OVERRIDE" as const, override: { ...zeroOverride(), regularMinutes: 240 } };
    expect(dailyPayload(form).override?.regularMinutes).toBe(240);
    expect(dailyPreviewInput(form).override?.regularMinutes).toBe(240);
  });

  it("ignores unused override values in the dirty signature", () => {
    const form = toDailyForm(record);
    const changedOverride = { ...form, override: { ...form.override, regularMinutes: 1 } };
    expect(dailyFormSignature(changedOverride)).toBe(dailyFormSignature(form));
  });
});

describe("validation", () => {
  it("accepts a complete daily form", () => {
    expect(validateDaily(toDailyForm(record))).toEqual({});
  });

  it("requires matching time values and valid limits", () => {
    const form = { ...toDailyForm(record), clockInMinute: 480, clockOutMinute: null, breakMinutes: 900, hoursSpentMinutes: 2000 };
    expect(validateDaily(form)).toMatchObject({
      clockOutMinute: expect.any(String),
      breakMinutes: expect.any(String),
      hoursSpentMinutes: expect.any(String)
    });
  });

  it("rejects invalid task counts and lengths", () => {
    const tooMany = { ...toDailyForm(record), tasksText: Array.from({ length: 101 }, (_, index) => `Task ${index}`).join("\n") };
    expect(validateDaily(tooMany).tasksText).toContain("100");
    const tooLong = { ...toDailyForm(record), tasksText: "x".repeat(2001) };
    expect(validateDaily(tooLong).tasksText).toContain("2,000");
  });

  it("validates manual override values", () => {
    const form = { ...toDailyForm(record), calculationMode: "OVERRIDE" as const, override: { ...zeroOverride(), regularMinutes: 2000 } };
    expect(validateDaily(form).regularMinutes).toContain("24 hours");
  });

  it("validates leave dates, range, days, and reason", () => {
    expect(validateLeave(leave)).toEqual({});
    expect(validateLeave({ ...leave, toDate: "2026-10-01" }).toDate).toContain("earlier");
    expect(validateLeave({ ...leave, numberOfDays: 32 }).numberOfDays).toContain("31");
    expect(validateLeave({ ...leave, reason: "   " }).reason).toContain("reason");
    expect(validateLeave({ ...leave, dateFiled: "2026-02-30" }).dateFiled).toContain("valid");
  });

  it("requires an employee name and bounded profile values", () => {
    expect(validateProfile(profile)).toEqual({});
    expect(validateProfile({ ...profile, employeeName: "  " }).employeeName).toContain("required");
    expect(validateProfile({ ...profile, standardBreakMinutes: 900 }).standardBreakMinutes).toContain("720");
    expect(validateProfile({ ...profile, shiftStartMinute: 1500 }).shiftStartMinute).toContain("valid");
  });
});
