import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DailyHours, DailyHoursPreviewInput } from "../api";
import { api } from "../api";
import { queryKeys } from "../query";

const emptyHours: DailyHours = { regularMinutes: 0, nightDiffMinutes: 0, regularOtMinutes: 0, nightDiffOtMinutes: 0, restDayMinutes: 0, restDayOtMinutes: 0, holidayMinutes: 0 };

const canPreview = (input: DailyHoursPreviewInput) => input.calculationMode === "OVERRIDE"
  || (input.clockInMinute !== null && input.clockOutMinute !== null && input.dayType !== "LEAVE" && input.dayType !== "ABSENT");

export type PreviewState = "idle" | "calculating" | "ready" | "error";

export const useDailyHoursPreview = (input: DailyHoursPreviewInput) => {
  const signature = JSON.stringify(input);
  const [debouncedInput, setDebouncedInput] = useState(input);
  const debouncedSignature = JSON.stringify(debouncedInput);
  const enabled = canPreview(input);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInput(input), 200);
    return () => window.clearTimeout(timer);
  }, [signature]);

  const query = useQuery({
    queryKey: queryKeys.dailyHoursPreview(debouncedInput),
    queryFn: ({ signal }) => api.previewDailyHours(debouncedInput, signal),
    enabled: enabled && debouncedSignature === signature
  });

  const calculating = enabled && (debouncedSignature !== signature || query.isPending || query.isFetching);
  const unavailable = enabled && !calculating && Boolean(query.error);
  const state: PreviewState = !enabled ? "idle" : calculating ? "calculating" : unavailable ? "error" : query.data ? "ready" : "idle";

  return {
    hours: enabled ? (calculating || unavailable ? null : query.data || null) : emptyHours,
    calculating,
    enabled,
    state,
    error: enabled && !calculating ? query.error : null
  };
};
