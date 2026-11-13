import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Holiday } from "../api";
import { HolidayConflictDialog } from "./HolidayConflictDialog";

const holidays: Holiday[] = [{
  date: "2026-11-01",
  name: "All Saints' Day",
  classification: "SPECIAL_NON_WORKING",
  isNonWorking: true,
  source: "OFFICIAL_PROCLAMATION",
  sourceUrl: "https://example.gov.ph"
}];

describe("HolidayConflictDialog", () => {
  it("shows the holiday and lets the user confirm a worked workday", async () => {
    const user = userEvent.setup();
    const onSaveAsWorkday = vi.fn();

    render(
      <HolidayConflictDialog
        open
        holidays={holidays}
        onCancel={vi.fn()}
        onChangeToHoliday={vi.fn()}
        onSaveAsWorkday={onSaveAsWorkday}
      />
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("All Saints' Day");
    await user.click(screen.getByRole("button", { name: "Save as Workday" }));
    expect(onSaveAsWorkday).toHaveBeenCalledOnce();
  });

  it("lets the user change the entry to Holiday", async () => {
    const user = userEvent.setup();
    const onChangeToHoliday = vi.fn();

    render(
      <HolidayConflictDialog
        open
        holidays={holidays}
        onCancel={vi.fn()}
        onChangeToHoliday={onChangeToHoliday}
        onSaveAsWorkday={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Change to Holiday" }));
    expect(onChangeToHoliday).toHaveBeenCalledOnce();
  });
});
