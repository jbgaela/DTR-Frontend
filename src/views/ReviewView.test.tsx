import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DailyRecord, Period } from "../api";
import { buildDateEntries, completionFor, missingSummaryFor } from "../domain/period";
import { sumRecords } from "../domain/records";
import { ReviewView } from "./ReviewView";

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

const dates = ["10/24/2026", "10/25/2026", "10/26/2026", "10/27/2026"];
const today = "10/27/2026";
const records = [
  record("10/24/2026", { dayType: "REST_DAY", regularMinutes: 0, clockInMinute: null, clockOutMinute: null }),
  record("10/25/2026", { regularOtMinutes: 60 }),
  record("10/26/2026")
];
const period: Period = { id: "period-1", startDate: "10/24/2026", endDate: "10/31/2026", dailyRecords: records, leaveRequest: null };
const entries = buildDateEntries([...dates, "10/28/2026", "10/29/2026", "10/30/2026", "10/31/2026"], records, today);

const renderView = (onSelect = vi.fn()) => render(
  <ReviewView
    period={period}
    entries={entries}
    completion={completionFor(entries)}
    missingSummary={missingSummaryFor(entries)}
    nextMissing={entries.find((entry) => entry.status === "today") ?? null}
    onSelect={onSelect}
    onGoTo={vi.fn()}
  />
);

describe("ReviewView", () => {
  it("renders authoritative categories and summary metrics", () => {
    renderView();
    expect(screen.getByRole("heading", { name: "Review the reporting period" })).toBeInTheDocument();
    expect(screen.getByText(/3 of 8 dates entered/)).toBeInTheDocument();
    expect(screen.getAllByText("Night OT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rest OT").length).toBeGreaterThan(0);
    expect(screen.getByText("With overtime")).toBeInTheDocument();
    expect(screen.getByText("1 date still needs an entry")).toBeInTheDocument();
  });

  it("filters saved entries without changing the underlying data", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole("button", { name: /Rest days/ }));
    expect(screen.getByText("1 of 3 shown")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /With overtime/ }));
    expect(screen.getByText("1 of 3 shown")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /All saved/ }));
    expect(screen.getByText("3 of 3 shown")).toBeInTheDocument();
  });

  it("opens the selected record for editing", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderView(onSelect);
    const edits = screen.getAllByRole("button", { name: "Edit entry for Oct 26" });
    await user.click(edits[0]);
    expect(onSelect).toHaveBeenCalledWith("10/26/2026");
  });

  it("shows an empty state for a period without records", () => {
    const emptyEntries = buildDateEntries(dates, [], today);
    render(
      <ReviewView
        period={{ ...period, dailyRecords: [] }}
        entries={emptyEntries}
        completion={completionFor(emptyEntries)}
        missingSummary={missingSummaryFor(emptyEntries)}
        nextMissing={emptyEntries.find((entry) => entry.status === "today") ?? null}
        onSelect={vi.fn()}
        onGoTo={vi.fn()}
      />
    );
    expect(screen.getByText("No daily entries yet")).toBeInTheDocument();
  });
});

