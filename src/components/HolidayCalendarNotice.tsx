import type { HolidayCalendar } from "../api";
import { messages as m } from "../constants/messages";
import { holidayCoverageYears } from "../domain/holidays";
import { InlineAlert } from "./ui";

export const HolidayCalendarNotice = ({ calendar, className }: { calendar?: HolidayCalendar; className?: string }) => {
  const years = holidayCoverageYears(calendar);
  if (!years.length) return null;
  return (
    <InlineAlert tone="warning" title={m.holidayCalendarEstimateTitle} className={className}>
      {m.holidayCalendarEstimateDescription(years.join(", "))}
    </InlineAlert>
  );
};
