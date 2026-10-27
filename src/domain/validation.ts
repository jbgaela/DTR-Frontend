import type { LeaveRequest, Profile } from "../api";
import type { DailyForm } from "./daily";
import { overrideFields, taskLines } from "./daily";
import { isValidIsoDate, parseIsoDate } from "./date";

export type FieldErrors = Record<string, string>;

export type LeaveDraft = {
  dateFiled: string;
  leaveType: LeaveRequest["leaveType"];
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
};

export const validateDaily = (form: DailyForm): FieldErrors => {
  const errors: FieldErrors = {};
  if (!Number.isInteger(form.breakMinutes) || form.breakMinutes < 0 || form.breakMinutes > 720) errors.breakMinutes = "Break must be a whole number between 0 and 720 minutes.";
  if ((form.clockInMinute === null) !== (form.clockOutMinute === null)) errors.clockOutMinute = "Enter both a time in and a time out, or leave both blank.";
  if (form.clockInMinute !== null && (!Number.isInteger(form.clockInMinute) || form.clockInMinute < 0 || form.clockInMinute > 1439)) errors.clockInMinute = "Choose a valid time in.";
  if (form.clockOutMinute !== null && (!Number.isInteger(form.clockOutMinute) || form.clockOutMinute < 0 || form.clockOutMinute > 1439)) errors.clockOutMinute = "Choose a valid time out.";
  if (!Number.isInteger(form.hoursSpentMinutes) || form.hoursSpentMinutes < 0 || form.hoursSpentMinutes > 1440) errors.hoursSpentMinutes = "Hours spent must be between 0 and 24 hours.";
  if (form.activity.length > 160) errors.activity = "Activity must be 160 characters or fewer.";
  if (form.accomplishmentType.length > 80) errors.accomplishmentType = "Type must be 80 characters or fewer.";
  if (form.accomplishmentStatus.length > 80) errors.accomplishmentStatus = "Status must be 80 characters or fewer.";
  if (form.remarks.length > 10000) errors.remarks = "Remarks must be 10,000 characters or fewer.";
  const tasks = taskLines(form.tasksText);
  if (tasks.length > 100) errors.tasksText = "Add no more than 100 task lines.";
  else if (tasks.some((task) => task.length > 2000)) errors.tasksText = "Each task line must be 2,000 characters or fewer.";
  if (form.calculationMode === "OVERRIDE") {
    overrideFields.forEach(({ key, label }) => {
      const value = form.override[key];
      if (!Number.isFinite(value) || value < 0 || value > 1440) errors[key] = `${label} must be between 0 and 24 hours.`;
    });
  }
  return errors;
};

export const validateLeave = (draft: LeaveDraft): FieldErrors => {
  const errors: FieldErrors = {};
  if (!isValidIsoDate(draft.dateFiled)) errors.dateFiled = "Choose a valid date filed.";
  if (!isValidIsoDate(draft.fromDate)) errors.fromDate = "Choose a valid start date.";
  if (!isValidIsoDate(draft.toDate)) errors.toDate = "Choose a valid end date.";
  const from = parseIsoDate(draft.fromDate);
  const to = parseIsoDate(draft.toDate);
  if (from && to && from > to) errors.toDate = "The end date cannot be earlier than the start date.";
  if (!Number.isFinite(draft.numberOfDays) || draft.numberOfDays <= 0 || draft.numberOfDays > 31) errors.numberOfDays = "Number of days must be greater than 0 and no more than 31.";
  if (!draft.reason.trim()) errors.reason = "Add a short reason for this request.";
  if (draft.reason.length > 10000) errors.reason = "Reason must be 10,000 characters or fewer.";
  return errors;
};

export const validateProfile = (profile: Profile): FieldErrors => {
  const errors: FieldErrors = {};
  if (!profile.employeeName.trim()) errors.employeeName = "Employee name is required.";
  else if (profile.employeeName.length > 160) errors.employeeName = "Employee name must be 160 characters or fewer.";
  if (profile.employeeId.length > 80) errors.employeeId = "Employee ID must be 80 characters or fewer.";
  if (profile.position.length > 160) errors.position = "Position must be 160 characters or fewer.";
  if (profile.projectAssignment.length > 160) errors.projectAssignment = "Project assignment must be 160 characters or fewer.";
  if (profile.validatorName.length > 160) errors.validatorName = "Validator name must be 160 characters or fewer.";
  if (profile.supervisorName.length > 160) errors.supervisorName = "Supervisor name must be 160 characters or fewer.";
  if (!Number.isInteger(profile.standardBreakMinutes) || profile.standardBreakMinutes < 0 || profile.standardBreakMinutes > 720) errors.standardBreakMinutes = "Standard break must be between 0 and 720 minutes.";
  if (!Number.isInteger(profile.regularLimitMinutes) || profile.regularLimitMinutes < 0 || profile.regularLimitMinutes > 1440) errors.regularLimitMinutes = "Regular-hour limit must be between 0 and 24 hours.";
  if (!Number.isInteger(profile.shiftStartMinute) || profile.shiftStartMinute < 0 || profile.shiftStartMinute > 1439) errors.shiftStartMinute = "Choose a valid shift start.";
  if (!Number.isInteger(profile.shiftEndMinute) || profile.shiftEndMinute < 0 || profile.shiftEndMinute > 1439) errors.shiftEndMinute = "Choose a valid shift end.";
  if (!Number.isInteger(profile.nightStartMinute) || profile.nightStartMinute < 0 || profile.nightStartMinute > 1439) errors.nightStartMinute = "Choose a valid night start.";
  if (!Number.isInteger(profile.nightEndMinute) || profile.nightEndMinute < 0 || profile.nightEndMinute > 1439) errors.nightEndMinute = "Choose a valid night end.";
  if (!profile.timezone.trim()) errors.timezone = "Reporting timezone is required.";
  return errors;
};

export const firstErrorKey = (errors: FieldErrors) => Object.keys(errors)[0] || null;
