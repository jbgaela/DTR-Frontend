import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Period } from "../api";
import { PeriodSelector } from "./PeriodSelector";

const period: Period = { id: "period-1", startDate: "10/16/2026", endDate: "10/31/2026", dailyRecords: [], leaveRequest: null };

describe("PeriodSelector", () => {
  it("loads a shortcut range", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn().mockResolvedValue(true);
    render(<PeriodSelector period={period} today="10/27/2026" preparing={false} onApply={onApply} />);

    await user.click(screen.getByRole("button", { name: /Oct 16 – 31, 2026/ }));
    expect(screen.getByRole("dialog", { name: "Reporting period" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Previous.*Oct 1 – 15, 2026/ }));
    await user.click(screen.getByRole("button", { name: "Load period" }));

    await waitFor(() => expect(onApply).toHaveBeenCalledWith("10/01/2026", "10/15/2026"));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Reporting period" })).not.toBeInTheDocument());
  });

  it("rejects a custom range whose start is after its end", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn().mockResolvedValue(true);
    render(<PeriodSelector period={period} today="10/27/2026" preparing={false} onApply={onApply} />);

    await user.click(screen.getByRole("button", { name: /Oct 16 – 31, 2026/ }));
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2026-11-01" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2026-10-31" } });
    await user.click(screen.getByRole("button", { name: "Load period" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("start date must be on or before");
    expect(onApply).not.toHaveBeenCalled();
  });

  it("keeps the panel open and shows a server error", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn().mockResolvedValue(false);
    render(<PeriodSelector period={period} today="10/27/2026" preparing={false} error="The period could not be loaded." onApply={onApply} />);

    await user.click(screen.getByRole("button", { name: /Oct 16 – 31, 2026/ }));
    await user.click(screen.getByRole("button", { name: "Load period" }));
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect(screen.getByRole("dialog", { name: "Reporting period" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("The period could not be loaded.");
  });
});
