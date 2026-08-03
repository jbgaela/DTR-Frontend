import { useEffect, useMemo, useState } from "react";
import type { DailyRecordInput, LeaveRequest, Period, Profile } from "../api";
import { api } from "../api";
import { messages as m } from "../constants/messages";
import { currentMonthRange, todayInput } from "../domain/date";
import { blankRecord, dateRange } from "../domain/records";

const emptyProfile: Profile = { employeeName: "", employeeId: "", position: "", projectAssignment: "", validatorName: "", supervisorName: "", shiftStartMinute: 420, shiftEndMinute: 960, standardBreakMinutes: 60, regularLimitMinutes: 480, nightStartMinute: 1320, nightEndMinute: 360, workdayMask: 62, timezone: "Asia/Manila" };
const emptyLeave: LeaveRequest = { dateFiled: todayInput(), leaveType: "VACATION", fromDate: "", toDate: "", numberOfDays: 1, reason: "" };
const defaultCutoff = currentMonthRange();

export const useDtrApp = () => {
  const [period, setPeriod] = useState<Period | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [selectedDate, setSelectedDate] = useState("");
  const [cutoffStart, setCutoffStart] = useState(defaultCutoff.start);
  const [cutoffEnd, setCutoffEnd] = useState(defaultCutoff.end);
  const [leave, setLeave] = useState<LeaveRequest>(emptyLeave);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const dates = useMemo(() => period ? dateRange(period.startDate, period.endDate) : [], [period]);
  const records = period?.dailyRecords || [];
  const currentRecord = records.find((record) => record.workDate === selectedDate) || (selectedDate ? blankRecord(selectedDate, profile) : null);
  const totals = records.reduce((sum, record) => ({ regular: sum.regular + record.regularMinutes, overtime: sum.overtime + record.regularOtMinutes, nightOt: sum.nightOt + record.nightDiffOtMinutes, rest: sum.rest + record.restDayMinutes + record.restDayOtMinutes }), { regular: 0, overtime: 0, nightOt: 0, rest: 0 });

  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(""), 2500); };
  const load = async (startDate = cutoffStart, endDate = cutoffEnd) => {
    try {
      setLoading(true);
      const data = await api.current(startDate, endDate);
      setAuthenticated(true);
      setPeriod(data.period);
      setProfile(data.profile);
      setSelectedDate(data.period.startDate);
      setCutoffStart(data.period.startDate);
      setCutoffEnd(data.period.endDate);
      setLeave(data.period.leaveRequest || { ...emptyLeave, dateFiled: todayInput() });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.loadError);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void api.session().then(() => load()).catch(() => { setAuthenticated(false); setLoading(false); }); }, []);
  const login = async (username: string, password: string) => { try { await api.login(username, password); setAuthenticated(true); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : m.loadError); } };

  const saveDay = async (value: DailyRecordInput) => {
    if (!period) return;
    try {
      const saved = await api.saveDay(period.id, selectedDate, value);
      setPeriod((current) => current ? { ...current, dailyRecords: [...current.dailyRecords.filter((record) => record.workDate !== selectedDate), saved].sort((a, b) => a.workDate.localeCompare(b.workDate)) } : current);
      showNotice(m.saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.saveError);
    }
  };
  const clearDay = async () => {
    if (!period || !records.some((record) => record.workDate === selectedDate)) return;
    try {
      await api.deleteDay(period.id, selectedDate);
      setPeriod((current) => current ? { ...current, dailyRecords: current.dailyRecords.filter((record) => record.workDate !== selectedDate) } : current);
      showNotice(m.saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.saveError);
    }
  };
  const saveProfile = async () => {
    try {
      setProfile(await api.saveProfile(profile));
      showNotice(m.saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.saveError);
    }
  };
  const saveLeave = async () => {
    if (!period) return;
    try {
      const saved = await api.saveLeave(period.id, leave);
      setPeriod((current) => current ? { ...current, leaveRequest: saved } : current);
      showNotice(m.saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.saveError);
    }
  };
  const clearLeave = async () => {
    if (!period) return;
    try {
      await api.deleteLeave(period.id);
      setPeriod((current) => current ? { ...current, leaveRequest: null } : current);
      setLeave({ ...emptyLeave, dateFiled: todayInput() });
      showNotice(m.saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : m.saveError);
    }
  };

  return { period, profile, setProfile, selectedDate, setSelectedDate, cutoffStart, setCutoffStart, cutoffEnd, setCutoffEnd, leave, setLeave, notice, error, loading, authenticated, dates, records, currentRecord, totals, load, login, saveDay, clearDay, saveProfile, saveLeave, clearLeave };
};
