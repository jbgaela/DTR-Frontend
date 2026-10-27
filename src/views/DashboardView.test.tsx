import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DailyRecord, Period, Profile } from "../api";
import { buildDateEntries, completionFor, missingSummaryFor } from "../domain/period";
import { sumRecords } from "../domain/records";
import { DashboardView } from "./DashboardView";

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
  hoursSpentMinutes: 480,
  remarks: "",
  tasks: [],
  ...overrides
});

const period: Period = { id: "period-1", startDate: "10/25/2026", endDate: "10/31/2026", dailyRecords: [], leaveRequest: null };
const dates = ["10/25/2026", "10/26/2026", "10/27/2026", "10/28/2026", "10/29/2026", "10/30/2026", "10/31/2026"];
const today = "10/27/2026";

describe("DashboardView", () => {
  it("shows progress, authoritative categories, and the next missing date", () => {
    const records = [record("10/25/2026", { regularMinutes: 480, regularOtMinutes: 60, nightDiffOtMinutes: 45 }), record("10/26/2026", { dayType: "REST_DAY", restDayMinutes: 240, regularMinutes: 0, clockInMinute: null, clockOutMinute: null })];
    const entries = buildDateEntries(dates, records, today);
    const onSelect = vi.fn();
    render(
      <DashboardView
        profile={profile}
        period={{ ...period, dailyRecords: records }}
        entries={entries}
        completion={completionFor(entries)}
        missingSummary={missingSummaryFor(entries)}
        totals={sumRecords(records)}
        today={today}
        onSelect={onSelect}
        onGoTo={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /Demo/ })).toBeInTheDocument();
    expect(screen.getByText("29% complete")).toBeInTheDocument();
    expect(screen.getAllByText("Overtime").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0.75").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Oct 26.*Rest day.*Open daily entry/ })).toBeInTheDocument();

    const add = screen.getByRole("button", { name: "Add daily entry" });
    expect(add).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("opens the next missing date from the primary action and date tile", async () => {
    const user = userEvent.setup();
    const entries = buildDateEntries(dates, [record("10/25/2026")], today);
    const onSelect = vi.fn();
    render(
      <DashboardView
        profile={profile}
        period={{ ...period, dailyRecords: [record("10/25/2026")] }}
        entries={entries}
        completion={completionFor(entries)}
        missingSummary={missingSummaryFor(entries)}
        totals={sumRecords([record("10/25/2026")])}
        today={today}
        onSelect={onSelect}
        onGoTo={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Add daily entry" }));
    expect(onSelect).toHaveBeenCalledWith("10/26/2026");

    await user.click(screen.getByRole("button", { name: /Oct 27.*Today · missing.*Open daily entry/ }));
    expect(onSelect).toHaveBeenLastCalledWith("10/27/2026");
  });

  it("does not call a future-only period complete or overdue", () => {
    const futurePeriod: Period = { id: "period-future", startDate: "11/01/2026", endDate: "11/02/2026", dailyRecords: [], leaveRequest: null };
    const futureEntries = buildDateEntries(["11/01/2026", "11/02/2026"], [], today);
    render(
      <DashboardView
        profile={profile}
        period={futurePeriod}
        entries={futureEntries}
        completion={completionFor(futureEntries)}
        missingSummary={missingSummaryFor(futureEntries)}
        totals={sumRecords([])}
        today={today}
        onSelect={vi.fn()}
        onGoTo={vi.fn()}
      />
    );
    expect(screen.getByText("This cutoff is upcoming")).toBeInTheDocument();
    expect(screen.queryByText("Every date through today is entered")).not.toBeInTheDocument();
  });

  it("shows the completed state when every date through today is entered", () => {
    const records = ["10/25/2026", "10/26/2026", "10/27/2026"].map((date) => record(date));
    const entries = buildDateEntries(dates, records, today);
    render(
      <DashboardView
        profile={profile}
        period={{ ...period, dailyRecords: records }}
        entries={entries}
        completion={completionFor(entries)}
        missingSummary={missingSummaryFor(entries)}
        totals={sumRecords(records)}
        today={today}
        onSelect={vi.fn()}
        onGoTo={vi.fn()}
      />
    );
    expect(screen.getByText("Every date through today is entered")).toBeInTheDocument();
    expect(screen.getByText(/upcoming date/)).toBeInTheDocument();
    expect(screen.queryByText("Today's entry is open")).not.toBeInTheDocument();
  });
});

