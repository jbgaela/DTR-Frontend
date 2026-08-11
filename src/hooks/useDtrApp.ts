import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CurrentResponse, DailyRecord, DailyRecordInput, LeaveRequest, Period, Profile } from "../api";
import { ApiError, api } from "../api";
import { messages as m } from "../constants/messages";
import { blankRecord, dateRange } from "../domain/records";
import { queryKeys } from "../query";

const emptyProfile: Profile = { employeeName: "", employeeId: "", position: "", projectAssignment: "", validatorName: "", supervisorName: "", shiftStartMinute: 420, shiftEndMinute: 960, standardBreakMinutes: 60, regularLimitMinutes: 480, nightStartMinute: 1320, nightEndMinute: 360, workdayMask: 62, timezone: "Asia/Manila" };
type Range = { startDate: string; endDate: string };

const messageFor = (reason: unknown, fallback: string) => reason instanceof Error ? reason.message : fallback;

export const useDtrApp = () => {
  const queryClient = useQueryClient();
  const [viewRange, setViewRange] = useState<Range | null>(null);
  const [cutoffStart, setCutoffStart] = useState("");
  const [cutoffEnd, setCutoffEnd] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [notice, setNotice] = useState("");
  const [operationError, setOperationError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const sessionQuery = useQuery({ queryKey: queryKeys.session, queryFn: api.session });
  const currentKey = queryKeys.currentPeriod(viewRange?.startDate, viewRange?.endDate);
  const currentQueryOptions = (range: Range | null = viewRange) => ({
    queryKey: queryKeys.currentPeriod(range?.startDate, range?.endDate),
    queryFn: () => api.current(range?.startDate, range?.endDate),
    enabled: Boolean(sessionQuery.data)
  });
  const currentQuery = useQuery(currentQueryOptions());
  const queryData = currentQuery.data;
  const period = queryData?.period || null;
  const profile = queryData?.profile || emptyProfile;
  const leave = period?.leaveRequest || null;
  const authenticated = Boolean(sessionQuery.data);
  const dates = useMemo(() => period ? dateRange(period.startDate, period.endDate) : [], [period]);
  const records = period?.dailyRecords || [];
  const currentRecord = records.find((record) => record.workDate === selectedDate) || (selectedDate ? blankRecord(selectedDate, profile) : null);
  const totals = records.reduce((sum, record) => ({ regular: sum.regular + record.regularMinutes, overtime: sum.overtime + record.regularOtMinutes, nightOt: sum.nightOt + record.nightDiffOtMinutes, rest: sum.rest + record.restDayMinutes + record.restDayOtMinutes }), { regular: 0, overtime: 0, nightOt: 0, rest: 0 });

  useEffect(() => {
    if (!period) return;
    setCutoffStart(period.startDate);
    setCutoffEnd(period.endDate);
    setSelectedDate((current) => current && dates.includes(current) ? current : period.startDate);
  }, [period?.id, period?.startDate, period?.endDate]);

  const showNotice = (value: string) => { setNotice(value); window.setTimeout(() => setNotice(""), 2500); };
  const updateCurrent = (updater: (current: CurrentResponse) => CurrentResponse) => queryClient.setQueryData<CurrentResponse>(currentKey, (current) => current ? updater(current) : current);
  const invalidateCurrent = () => queryClient.invalidateQueries({ queryKey: queryKeys.currentPeriods });

  const saveDayMutation = useMutation({
    mutationFn: ({ periodId, date, value }: { periodId: string; date: string; value: DailyRecordInput }) => api.saveDay(periodId, date, value),
    onSuccess: async (saved: DailyRecord) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, dailyRecords: [...current.period.dailyRecords.filter((record) => record.workDate !== saved.workDate), saved].sort((a, b) => a.workDate.localeCompare(b.workDate)) } }));
      await invalidateCurrent();
      setOperationError("");
      showNotice(m.saved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const clearDayMutation = useMutation({
    mutationFn: ({ periodId, date }: { periodId: string; date: string }) => api.deleteDay(periodId, date),
    onSuccess: async (_, variables) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, dailyRecords: current.period.dailyRecords.filter((record) => record.workDate !== variables.date) } }));
      await invalidateCurrent();
      setOperationError("");
      showNotice(m.saved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const saveProfileMutation = useMutation({
    mutationFn: (value: Profile) => api.saveProfile(value),
    onSuccess: async (saved: Profile) => {
      updateCurrent((current) => ({ ...current, profile: saved }));
      await invalidateCurrent();
      setOperationError("");
      showNotice(m.saved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const saveLeaveMutation = useMutation({
    mutationFn: ({ periodId, value }: { periodId: string; value: LeaveRequest }) => api.saveLeave(periodId, value),
    onSuccess: async (saved: LeaveRequest) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, leaveRequest: saved } }));
      await invalidateCurrent();
      setOperationError("");
      showNotice(m.saved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const clearLeaveMutation = useMutation({
    mutationFn: (periodId: string) => api.deleteLeave(periodId),
    onSuccess: async () => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, leaveRequest: null } }));
      await invalidateCurrent();
      setOperationError("");
      showNotice(m.saved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => api.login(username, password),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.session, data),
    onError: (reason) => setOperationError(messageFor(reason, m.loadError))
  });

  const refreshPeriod = async (startDate = cutoffStart, endDate = cutoffEnd) => {
    const nextRange = { startDate, endDate };
    setRefreshing(true);
    setRefreshError("");
    try {
      await queryClient.fetchQuery({ ...currentQueryOptions(nextRange), staleTime: 0 });
      setViewRange(nextRange);
      setOperationError("");
    } catch (reason) {
      setRefreshError(messageFor(reason, m.loadError));
    } finally {
      setRefreshing(false);
    }
  };
  const retryLoad = async () => {
    setRetrying(true);
    setOperationError("");
    try {
      const session = sessionQuery.data || await queryClient.fetchQuery({ queryKey: queryKeys.session, queryFn: api.session });
      queryClient.setQueryData(queryKeys.session, session);
      await queryClient.fetchQuery({ ...currentQueryOptions(), staleTime: 0 });
    } catch (reason) {
      setOperationError(messageFor(reason, m.loadError));
    } finally {
      setRetrying(false);
    }
  };
  const login = async (username: string, password: string) => {
    setLoggingIn(true);
    setOperationError("");
    try {
      await loginMutation.mutateAsync({ username, password });
      await queryClient.fetchQuery({ ...currentQueryOptions(), staleTime: 0 });
    } catch (reason) {
      setOperationError(messageFor(reason, m.loadError));
    } finally {
      setLoggingIn(false);
    }
  };
  const saveDay = async (value: DailyRecordInput) => { if (period) { try { await saveDayMutation.mutateAsync({ periodId: period.id, date: selectedDate, value }); } catch { /* surfaced through operationError */ } } };
  const clearDay = async () => { if (period && records.some((record) => record.workDate === selectedDate)) { try { await clearDayMutation.mutateAsync({ periodId: period.id, date: selectedDate }); } catch { /* surfaced through operationError */ } } };
  const saveProfile = async (value: Profile) => { try { return await saveProfileMutation.mutateAsync(value); } catch { return null; } };
  const saveLeave = async (value: LeaveRequest) => { if (!period) return null; try { return await saveLeaveMutation.mutateAsync({ periodId: period.id, value }); } catch { return null; } };
  const clearLeave = async () => { if (!period) return false; try { await clearLeaveMutation.mutateAsync(period.id); return true; } catch { return false; } };

  const sessionUnauthorized = sessionQuery.error instanceof ApiError && sessionQuery.error.status === 401;
  const fatalError = !period && !sessionUnauthorized ? messageFor(currentQuery.error || sessionQuery.error, "") : "";
  const mutationError = [saveDayMutation.error, clearDayMutation.error, saveProfileMutation.error, saveLeaveMutation.error, clearLeaveMutation.error].find(Boolean);
  const error = operationError || refreshError || (mutationError ? messageFor(mutationError, m.saveError) : "");
  const blockingLoading = loggingIn || retrying || loginMutation.isPending || sessionQuery.isPending || (authenticated && currentQuery.isPending && !queryData);

  return { period, profile, leave, selectedDate, setSelectedDate, cutoffStart, setCutoffStart, cutoffEnd, setCutoffEnd, notice, error, fatalError, blockingLoading, refreshing, authenticated, dates, records, currentRecord, totals, refreshPeriod, retryLoad, login, saveDay, clearDay, saveProfile, saveLeave, clearLeave, savingDay: saveDayMutation.isPending, clearingDay: clearDayMutation.isPending, savingProfile: saveProfileMutation.isPending, savingLeave: saveLeaveMutation.isPending, clearingLeave: clearLeaveMutation.isPending };
};
