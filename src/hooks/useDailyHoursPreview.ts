import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DailyHours, DailyHoursPreviewInput } from "../api";
import { api } from "../api";
import { queryKeys } from "../query";

const emptyHours: DailyHours = { regularMinutes: 0, nightDiffMinutes: 0, regularOtMinutes: 0, nightDiffOtMinutes: 0, restDayMinutes: 0, restDayOtMinutes: 0, holidayMinutes: 0 };

const canPreview = (input: DailyHoursPreviewInput) => input.calculationMode === "OVERRIDE"
  || (input.clockInMinute !== null && input.clockOutMinute !== null && input.dayType !== "LEAVE" && input.dayType !== "ABSENT");

export const useDailyHoursPreview = (input: DailyHoursPreviewInput) => {
  const signature = JSON.stringify(input);
  const [debouncedInput, setDebouncedInput] = useState(input);
  const debouncedSignature = JSON.stringify(debouncedInput);
  const previewEnabled = canPreview(input);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInput(input), 200);
    return () => window.clearTimeout(timer);
  }, [signature]);

  const query = useQuery({
    queryKey: queryKeys.dailyHoursPreview(debouncedInput),
    queryFn: ({ signal }) => api.previewDailyHours(debouncedInput, signal),
    enabled: previewEnabled && debouncedSignature === signature
  });
  const calculating = previewEnabled && (debouncedSignature !== signature || query.isPending || query.isFetching);

  return {
    hours: previewEnabled ? (calculating ? null : query.data || null) : emptyHours,
    calculating,
    error: previewEnabled && !calculating ? query.error : null
  };
};
