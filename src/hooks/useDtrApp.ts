import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { CurrentResponse, DailyRecord, DailyRecordInput, LeaveRequest, Profile, SessionResponse } from "../api";
import { ApiError, api, setUnauthorizedHandler } from "../api";
import { messages as m } from "../constants/messages";
import { currentSemiMonthlyRange, displayToIso, eachDateInRange, isValidRange, isoToDisplay, todayInTimezone } from "../domain/date";
import { buildDateEntries, completionFor, missingSummaryFor, nextActionFor, nextMissingFor } from "../domain/period";
import { blankRecord, dateRange, findRecord, sumRecords } from "../domain/records";
import { queryKeys } from "../query";
import type { Notice, NoticeKind } from "../components/Toast";

const emptyProfile: Profile = { employeeName: "", employeeId: "", position: "", projectAssignment: "", validatorName: "", supervisorName: "", shiftStartMinute: 420, shiftEndMinute: 960, standardBreakMinutes: 60, regularLimitMinutes: 480, nightStartMinute: 1320, nightEndMinute: 360, workdayMask: 62, timezone: "Asia/Manila" };

type Range = { startDate: string; endDate: string };

const messageFor = (reason: unknown, fallback: string) => reason instanceof Error ? reason.message : fallback;

const fetchSession = async (): Promise<SessionResponse | null> => {
  try {
    return await api.session();
  } catch (reason) {
    if (reason instanceof ApiError && reason.status === 401) return null;
    throw reason;
  }
};

const readRange = (params: URLSearchParams): Range | null => {
  const startDate = isoToDisplay(params.get("start") ?? "");
  const endDate = isoToDisplay(params.get("end") ?? "");
  return isValidRange(startDate, endDate) ? { startDate, endDate } : null;
};

const appPaths = new Set(["/dashboard", "/daily", "/review", "/leave", "/settings", "/exports"]);

export const useDtrApp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fallbackRange = useMemo(() => currentSemiMonthlyRange(), []);
  const explicitRange = useMemo(() => readRange(searchParams), [searchParams]);
  const range = explicitRange ?? fallbackRange;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [operationError, setOperationError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const noticeTimer = useRef<number | null>(null);

  const dismissNotice = useCallback(() => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = null;
    setNotice(null);
  }, []);

  const notify = useCallback((kind: NoticeKind, message: string) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    setNotice({ id: Date.now(), kind, message });
    noticeTimer.current = window.setTimeout(() => { setNotice(null); noticeTimer.current = null; }, kind === "error" ? 6000 : 4000);
  }, []);

  useEffect(() => () => { if (noticeTimer.current) window.clearTimeout(noticeTimer.current); }, []);

  const sessionQuery = useQuery<SessionResponse | null>({
    queryKey: queryKeys.session,
    queryFn: fetchSession
  });
  const authenticated = Boolean(sessionQuery.data);
  const sessionError = sessionQuery.isError ? messageFor(sessionQuery.error, m.loadError) : "";

  const currentKey = queryKeys.currentPeriod(explicitRange?.startDate, explicitRange?.endDate);
  const currentQuery = useQuery({
    queryKey: currentKey,
    queryFn: () => explicitRange ? api.current(explicitRange.startDate, explicitRange.endDate) : api.current(),
    enabled: authenticated
  });
  const queryData = currentQuery.data;
  const period = queryData?.period ?? null;
  const profile = queryData?.profile ?? emptyProfile;
  const dates = useMemo(() => period ? dateRange(period.startDate, period.endDate) : [], [period]);
  const records = useMemo(() => period?.dailyRecords ?? [], [period]);
  const totals = useMemo(() => sumRecords(records), [records]);
  const today = useMemo(() => todayInTimezone(profile.timezone), [profile.timezone, currentQuery.dataUpdatedAt]);
  const entries = useMemo(() => buildDateEntries(dates, records, today), [dates, records, today]);
  const completion = useMemo(() => completionFor(entries), [entries]);
  const missingSummary = useMemo(() => missingSummaryFor(entries), [entries]);
  const nextAction = useMemo(() => nextActionFor(entries), [entries]);
  const nextMissing = useMemo(() => nextMissingFor(entries), [entries]);
  const attentionCount = missingSummary.missing + missingSummary.today;

  const selectedDate = useMemo(() => {
    const fromUrl = isoToDisplay(searchParams.get("date") ?? "");
    if (fromUrl && dates.includes(fromUrl)) return fromUrl;
    if (dates.includes(today)) return today;
    return dates[0] ?? period?.startDate ?? "";
  }, [searchParams, dates, today, period?.startDate]);

  const currentRecord = useMemo(() => {
    if (!selectedDate) return null;
    return findRecord(records, selectedDate) ?? blankRecord(selectedDate, profile);
  }, [records, selectedDate, profile]);

  const updateCurrent = useCallback((updater: (current: CurrentResponse) => CurrentResponse) => {
    queryClient.setQueryData<CurrentResponse>(currentKey, (current) => current ? updater(current) : current);
  }, [queryClient, currentKey]);
  const invalidateCurrent = useCallback(() => queryClient.invalidateQueries({ queryKey: queryKeys.currentPeriods }), [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData<SessionResponse | null>(queryKeys.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.currentPeriods });
      setOperationError("");
      notify("error", m.sessionExpired);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, notify]);

  useEffect(() => {
    setOperationError("");
  }, [location.pathname]);

  useEffect(() => {
    if (!authenticated || explicitRange || !queryData) return;
    const key = queryKeys.currentPeriod(queryData.period.startDate, queryData.period.endDate);
    queryClient.setQueryData(key, queryData);
    const params = new URLSearchParams(searchParams);
    params.set("start", displayToIso(queryData.period.startDate));
    params.set("end", displayToIso(queryData.period.endDate));
    setSearchParams(params, { replace: true });
  }, [authenticated, explicitRange, queryData, searchParams, setSearchParams, queryClient]);

  useEffect(() => {
    if (!period || location.pathname !== "/daily") return;
    const fromUrl = isoToDisplay(searchParams.get("date") ?? "");
    if (fromUrl && dates.includes(fromUrl)) return;
    const fallbackDate = dates.includes(today) ? today : period.startDate;
    const params = new URLSearchParams(searchParams);
    params.set("date", displayToIso(fallbackDate));
    setSearchParams(params, { replace: true });
  }, [period, location.pathname, searchParams, dates, today, setSearchParams]);

  const saveSuccess = useCallback((message: string) => {
    setOperationError("");
    notify("success", message);
  }, [notify]);

  const saveDayMutation = useMutation({
    mutationFn: ({ periodId, date, value }: { periodId: string; date: string; value: DailyRecordInput }) => api.saveDay(periodId, date, value),
    onSuccess: async (saved: DailyRecord) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, dailyRecords: [...current.period.dailyRecords.filter((record) => record.workDate !== saved.workDate), saved].sort((a, b) => a.workDate.localeCompare(b.workDate)) } }));
      await invalidateCurrent();
      saveSuccess(m.dailySaved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const clearDayMutation = useMutation({
    mutationFn: ({ periodId, date }: { periodId: string; date: string }) => api.deleteDay(periodId, date),
    onSuccess: async (_, variables) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, dailyRecords: current.period.dailyRecords.filter((record) => record.workDate !== variables.date) } }));
      await invalidateCurrent();
      saveSuccess(m.entryDeleted);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const saveProfileMutation = useMutation({
    mutationFn: (value: Profile) => api.saveProfile(value),
    onSuccess: async (saved: Profile) => {
      updateCurrent((current) => ({ ...current, profile: saved }));
      await invalidateCurrent();
      saveSuccess(m.profileSaved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const saveLeaveMutation = useMutation({
    mutationFn: ({ periodId, value }: { periodId: string; value: LeaveRequest }) => api.saveLeave(periodId, value),
    onSuccess: async (saved: LeaveRequest) => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, leaveRequest: saved } }));
      await invalidateCurrent();
      saveSuccess(m.leaveSaved);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });
  const clearLeaveMutation = useMutation({
    mutationFn: (periodId: string) => api.deleteLeave(periodId),
    onSuccess: async () => {
      updateCurrent((current) => ({ ...current, period: { ...current.period, leaveRequest: null } }));
      await invalidateCurrent();
      saveSuccess(m.leaveDeleted);
    },
    onError: (reason) => setOperationError(messageFor(reason, m.saveError))
  });

  const prepareRange = useCallback(async (startDate: string, endDate: string) => {
    if (!isValidRange(startDate, endDate)) {
      setRefreshError(m.invalidPeriodRange);
      return false;
    }
    setRefreshing(true);
    setRefreshError("");
    try {
      await queryClient.fetchQuery({ queryKey: queryKeys.currentPeriod(startDate, endDate), queryFn: () => api.current(startDate, endDate), staleTime: 0 });
      return true;
    } catch (reason) {
      setRefreshError(messageFor(reason, m.loadError));
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const applyRange = useCallback((startDate: string, endDate: string) => {
    const currentStart = period?.startDate ?? range.startDate;
    const currentEnd = period?.endDate ?? range.endDate;
    if (startDate === currentStart && endDate === currentEnd) return;
    const params = new URLSearchParams(searchParams);
    params.set("start", displayToIso(startDate));
    params.set("end", displayToIso(endDate));
    const dateParam = isoToDisplay(params.get("date") ?? "");
    if (dateParam && !eachDateInRange(startDate, endDate).includes(dateParam)) params.delete("date");
    setSearchParams(params);
    setOperationError("");
  }, [period?.startDate, period?.endDate, range.startDate, range.endDate, searchParams, setSearchParams]);

  const periodSearch = useMemo(() => {
    const params = new URLSearchParams();
    params.set("start", displayToIso(period?.startDate ?? range.startDate));
    params.set("end", displayToIso(period?.endDate ?? range.endDate));
    return `?${params.toString()}`;
  }, [period?.startDate, period?.endDate, range.startDate, range.endDate]);

  const dailySearch = useMemo(() => {
    const params = new URLSearchParams(periodSearch);
    if (selectedDate) params.set("date", displayToIso(selectedDate));
    return `?${params.toString()}`;
  }, [periodSearch, selectedDate]);

  const openDate = useCallback((date: string) => {
    const params = new URLSearchParams(periodSearch);
    params.set("date", displayToIso(date));
    navigate({ pathname: "/daily", search: `?${params.toString()}` });
  }, [navigate, periodSearch]);

  const goTo = useCallback((pathname: string) => {
    const params = new URLSearchParams(periodSearch);
    if (pathname === "/daily" && selectedDate) params.set("date", displayToIso(selectedDate));
    navigate({ pathname, search: `?${params.toString()}` });
  }, [navigate, periodSearch, selectedDate]);

  const login = useCallback(async (username: string, password: string) => {
    setLoggingIn(true);
    setOperationError("");
    try {
      const session = await api.login(username, password);
      queryClient.setQueryData(queryKeys.session, session);
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      noticeTimer.current = null;
      setNotice(null);
      const target = appPaths.has(location.pathname) ? location.pathname : "/dashboard";
      const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
      navigate({ pathname: target, search }, { replace: true });
      return true;
    } catch (reason) {
      setOperationError(messageFor(reason, m.loadError));
      return false;
    } finally {
      setLoggingIn(false);
    }
  }, [queryClient, navigate, searchParams, location.pathname]);

  const retryLoad = useCallback(async () => {
    setRetrying(true);
    setOperationError("");
    try {
      const session = await queryClient.fetchQuery({ queryKey: queryKeys.session, queryFn: fetchSession, staleTime: 0 });
      queryClient.setQueryData(queryKeys.session, session);
      if (session) await queryClient.fetchQuery({ queryKey: currentKey, queryFn: () => explicitRange ? api.current(explicitRange.startDate, explicitRange.endDate) : api.current(), staleTime: 0 });
    } catch (reason) {
      setOperationError(messageFor(reason, m.loadError));
    } finally {
      setRetrying(false);
    }
  }, [queryClient, currentKey, explicitRange]);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    setOperationError("");
    try {
      await api.logout();
      queryClient.setQueryData<SessionResponse | null>(queryKeys.session, null);
      queryClient.removeQueries({ queryKey: queryKeys.currentPeriods });
      setNotice({ id: Date.now(), kind: "success", message: m.signedOut });
      navigate("/login", { replace: true });
      return true;
    } catch (reason) {
      setOperationError(messageFor(reason, m.saveError));
      return false;
    } finally {
      setLoggingOut(false);
    }
  }, [queryClient, navigate]);

  const saveDay = useCallback(async (value: DailyRecordInput) => {
    if (!period || !selectedDate) return null;
    setOperationError("");
    try {
      return await saveDayMutation.mutateAsync({ periodId: period.id, date: selectedDate, value });
    } catch {
      return null;
    }
  }, [period, selectedDate, saveDayMutation]);

  const clearDay = useCallback(async () => {
    if (!period || !selectedDate) return false;
    if (!records.some((record) => record.workDate === selectedDate)) return true;
    setOperationError("");
    try {
      await clearDayMutation.mutateAsync({ periodId: period.id, date: selectedDate });
      return true;
    } catch {
      return false;
    }
  }, [period, selectedDate, records, clearDayMutation]);

  const saveProfile = useCallback(async (value: Profile) => { setOperationError(""); try { return await saveProfileMutation.mutateAsync(value); } catch { return null; } }, [saveProfileMutation]);
  const saveLeave = useCallback(async (value: LeaveRequest) => { if (!period) return null; setOperationError(""); try { return await saveLeaveMutation.mutateAsync({ periodId: period.id, value }); } catch { return null; } }, [period, saveLeaveMutation]);
  const clearLeave = useCallback(async () => { if (!period) return false; setOperationError(""); try { await clearLeaveMutation.mutateAsync(period.id); return true; } catch { return false; } }, [period, clearLeaveMutation]);

  const fatalError = sessionError || (authenticated && !currentQuery.isPending && currentQuery.isError && !period ? messageFor(currentQuery.error, m.loadError) : "");
  const blockingLoading = sessionQuery.isPending || retrying || (authenticated && currentQuery.isPending && !queryData);

  return {
    period,
    profile,
    leave: period?.leaveRequest ?? null,
    selectedDate,
    setSelectedDate: openDate,
    openDate,
    goTo,
    periodSearch,
    dailySearch,
    range,
    dates,
    records,
    entries,
    completion,
    missingSummary,
    nextAction,
    nextMissing,
    attentionCount,
    totals,
    currentRecord,
    today,
    notice,
    notify,
    dismissNotice,
    error: operationError || refreshError,
    operationError,
    refreshError,
    dismissError: () => setOperationError(""),
    refreshErrorDismiss: () => setRefreshError(""),
    fatalError,
    blockingLoading,
    refreshing,
    retrying,
    authenticated,
    loggingIn,
    loggingOut,
    prepareRange,
    applyRange,
    retryLoad,
    login,
    logout,
    saveDay,
    clearDay,
    saveProfile,
    saveLeave,
    clearLeave,
    savingDay: saveDayMutation.isPending,
    clearingDay: clearDayMutation.isPending,
    savingProfile: saveProfileMutation.isPending,
    savingLeave: saveLeaveMutation.isPending,
    clearingLeave: clearLeaveMutation.isPending
  };
};

export type DtrAppState = ReturnType<typeof useDtrApp>;
