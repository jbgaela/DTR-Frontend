import type { DayType } from "../api";

export const hours = (minutes: number) => (minutes / 60).toFixed(2);

export const hoursValue = (minutes: number) => Number((minutes / 60).toFixed(2));

export const formatClock = (minute: number | null) => {
  if (minute === null || !Number.isFinite(minute)) return "—";
  const normalized = ((Math.round(minute) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export const formatDuration = (minutes: number) => {
  const total = Math.max(0, Math.round(minutes));
  const hour = Math.floor(total / 60);
  const remaining = total % 60;
  if (!hour) return `${remaining}m`;
  if (!remaining) return `${hour}h`;
  return `${hour}h ${remaining}m`;
};

export const formatPercentage = (value: number) => `${Math.max(0, Math.min(100, Math.round(value)))}%`;

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export const dayTypeLabel = (dayType: DayType) => {
  switch (dayType) {
    case "WORKDAY": return "Workday";
    case "REST_DAY": return "Rest day";
    case "HOLIDAY": return "Holiday";
    case "LEAVE": return "Leave";
    case "ABSENT": return "Absent";
    default: return dayType;
  }
};

export const leaveTypeLabel = (leaveType: "VACATION" | "SICK" | "OTHER") => {
  switch (leaveType) {
    case "VACATION": return "Vacation leave";
    case "SICK": return "Sick leave";
    default: return "Other";
  }
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
