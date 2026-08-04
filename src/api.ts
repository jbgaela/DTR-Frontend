import { messages } from "./constants/messages";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type DayType = "WORKDAY" | "REST_DAY" | "HOLIDAY" | "LEAVE" | "ABSENT";
export type CalculationMode = "AUTO" | "OVERRIDE";

export type Profile = {
  employeeName: string;
  employeeId: string;
  position: string;
  projectAssignment: string;
  validatorName: string;
  supervisorName: string;
  shiftStartMinute: number;
  shiftEndMinute: number;
  standardBreakMinutes: number;
  regularLimitMinutes: number;
  nightStartMinute: number;
  nightEndMinute: number;
  workdayMask: number;
  timezone: string;
};

export type TaskItem = { id?: string; position: number; text: string };

export type DailyRecord = {
  id: string;
  workDate: string;
  dayType: DayType;
  clockInMinute: number | null;
  clockOutMinute: number | null;
  endsNextDay: boolean;
  breakMinutes: number;
  calculationMode: CalculationMode;
  regularMinutes: number;
  nightDiffMinutes: number;
  regularOtMinutes: number;
  nightDiffOtMinutes: number;
  restDayMinutes: number;
  restDayOtMinutes: number;
  holidayMinutes: number;
  activity: string;
  accomplishmentType: string;
  accomplishmentStatus: string;
  hoursSpentMinutes: number;
  remarks: string;
  tasks: TaskItem[];
};
export type DailyRecordInput = Omit<DailyRecord, "id" | "workDate" | "regularMinutes" | "nightDiffMinutes" | "regularOtMinutes" | "nightDiffOtMinutes" | "restDayMinutes" | "restDayOtMinutes" | "holidayMinutes" | "tasks"> & { tasks: string[]; override?: Record<string, number> };

export type LeaveRequest = {
  dateFiled: string;
  leaveType: "VACATION" | "SICK" | "OTHER";
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
};

export type Period = { id: string; startDate: string; endDate: string; dailyRecords: DailyRecord[]; leaveRequest: LeaveRequest | null };
export type CurrentResponse = { period: Period; profile: Profile };
export type AuthUser = { username: string };

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error?.message || messages.requestFailed);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const api = {
  login: (username: string, password: string) => request<{ user: AuthUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  session: () => request<{ user: AuthUser }>("/api/auth/session"),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  current: (startDate?: string, endDate?: string) => {
    const query = startDate && endDate ? `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` : "";
    return request<CurrentResponse>(`/api/periods/current${query}`);
  },
  profile: () => request<Profile>("/api/profile"),
  saveProfile: (profile: Profile) => request<Profile>("/api/profile", { method: "PUT", body: JSON.stringify(profile) }),
  saveDay: (periodId: string, date: string, body: unknown) => request<DailyRecord>(`/api/periods/${periodId}/days?date=${encodeURIComponent(date)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDay: (periodId: string, date: string) => request<void>(`/api/periods/${periodId}/days?date=${encodeURIComponent(date)}`, { method: "DELETE" }),
  saveLeave: (periodId: string, leave: LeaveRequest) => request<LeaveRequest>(`/api/periods/${periodId}/leave`, { method: "PUT", body: JSON.stringify(leave) }),
  deleteLeave: (periodId: string) => request<void>(`/api/periods/${periodId}/leave`, { method: "DELETE" })
};

export const minuteToTime = (minute: number | null) => minute === null ? "" : `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export const timeToMinute = (value: string) => value ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : null;
export const hours = (minutes: number) => (minutes / 60).toFixed(2);
