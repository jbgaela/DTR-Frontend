import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { HolidayCalendar } from "../api";
import { HolidayCalendarNotice } from "./HolidayCalendarNotice";

describe("HolidayCalendarNotice", () => {
  it("warns when one or more calendar years are estimates", () => {
    const calendar: HolidayCalendar = {
      version: "ph-national-v1",
      status: "ESTIMATE",
      years: [{ year: 2026, status: "REVIEWED" }, { year: 2027, status: "ESTIMATE" }],
      holidays: []
    };

    render(<HolidayCalendarNotice calendar={calendar} />);

    expect(screen.getByRole("alert")).toHaveTextContent("2027");
  });

  it("does not show an alert when the selected range is fully reviewed", () => {
    const calendar: HolidayCalendar = {
      version: "ph-national-v1",
      status: "REVIEWED",
      years: [{ year: 2026, status: "REVIEWED" }],
      holidays: []
    };

    const { container } = render(<HolidayCalendarNotice calendar={calendar} />);

    expect(container).toBeEmptyDOMElement();
  });
});
