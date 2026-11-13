import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DailyRecord, DailyRecordInput, DaySaveResult, HolidayAcknowledgement, HolidayCalendar, Period, Profile } from "../api";
import { UnsavedProvider } from "../components/unsaved";
import { DailyEntryView } from "./DailyEntryView";

const profile: Profile = {
  employeeName: "Demo Employee",
  employeeId: "DEMO-0001",
  position: "Software Engineer",
  projectAssignment: "Demo",
  validatorName: "Validator",
  supervisorName: "Supervisor",
  shiftStartMinute: 420,
  shiftEndMinute: 960,
  standardBreakMinutes: 60,
  regularLimitMinutes: 480,
  nightStartMinute: 1320,
  nightEndMinute: 360,
  workdayMask: 62,
  timezone: "Asia/Manila"
};

const period: Period = { id: "period-1", startDate: "11/01/2026", endDate: "11/15/2026", dailyRecords: [], leaveRequest: null };
const record: DailyRecord = {
  id: "record-1",
  workDate: "11/01/2026",
  dayType: "WORKDAY",
  clockInMinute: 420,
  clockOutMinute: 960,
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
  tasks: []
};
const holidayCalendar: HolidayCalendar = {
  version: "ph-national-2026-v1",
  status: "REVIEWED",
  years: [{ year: 2026, status: "REVIEWED" }],
  holidays: [{ date: "2026-11-01", name: "Synthetic Holiday", classification: "SPECIAL_NON_WORKING", isNonWorking: true, source: "OFFICIAL_PROCLAMATION", sourceUrl: "https://example.gov.ph" }]
};

afterEach(() => vi.unstubAllGlobals());

describe("DailyEntryView holiday confirmation", () => {
  it("lets the user confirm an unchanged saved workday on a non-working holiday", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const onSave = vi.fn(async (_input: DailyRecordInput, _acknowledgement?: HolidayAcknowledgement): Promise<DaySaveResult> => ({ status: "saved", record }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ regularMinutes: 480, nightDiffMinutes: 0, regularOtMinutes: 0, nightDiffOtMinutes: 0, restDayMinutes: 0, restDayOtMinutes: 0, holidayMinutes: 0 }) }));

    render(
      <QueryClientProvider client={queryClient}>
        <UnsavedProvider value={{ dirty: false, setDirty: vi.fn(), requestConfirmation: async () => true }}>
          <DailyEntryView
            record={record}
            profile={profile}
            period={period}
            holidayCalendar={holidayCalendar}
            dates={["11/01/2026"]}
            selectedDate="11/01/2026"
            today="11/13/2026"
            onDate={vi.fn()}
            onSave={onSave}
            onClear={async () => true}
            saving={false}
            clearing={false}
          />
        </UnsavedProvider>
      </QueryClientProvider>
    );

    const saveButton = screen.getByRole("button", { name: "Save entry" });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(screen.getByRole("dialog")).toHaveTextContent("Synthetic Holiday");
    expect(onSave).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save as Workday" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][1]).toEqual({ date: "11/01/2026", calendarVersion: holidayCalendar.version });
  });
});
