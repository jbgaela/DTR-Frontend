import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useBlocker, useLocation, useNavigate } from "react-router-dom";
import { Globe2, Menu } from "lucide-react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { MobileNavigation } from "./components/MobileNavigation";
import { PeriodSelector } from "./components/PeriodSelector";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { UserMenu } from "./components/UserMenu";
import { InlineAlert, IconButton, PageSkeleton } from "./components/ui";
import { UnsavedProvider, type ConfirmationOptions } from "./components/unsaved";
import { messages as m } from "./constants/messages";
import { formatRangeLabel } from "./domain/date";
import { useDtrApp } from "./hooks/useDtrApp";
import { DashboardView } from "./views/DashboardView";
import { LoginView } from "./views/LoginView";

const DailyEntryView = lazy(async () => ({ default: (await import("./views/DailyEntryView")).DailyEntryView }));
const LeaveView = lazy(async () => ({ default: (await import("./views/LeaveView")).LeaveView }));
const ReviewView = lazy(async () => ({ default: (await import("./views/ReviewView")).ReviewView }));
const SettingsView = lazy(async () => ({ default: (await import("./views/SettingsView")).SettingsView }));
const ExportsView = lazy(async () => ({ default: (await import("./views/ExportsView")).ExportsView }));

const appPaths = new Set(["/dashboard", "/daily", "/review", "/leave", "/settings", "/exports"]);
const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/daily": "Daily entry",
  "/review": "Period review",
  "/leave": "Leave form",
  "/settings": "Settings",
  "/exports": "Exports"
};

export const App = () => {
  const state = useDtrApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [dirty, setDirty] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationOptions | null>(null);
  const confirmationResolver = useRef<((value: boolean) => void) | null>(null);
  const allowNavigation = useRef(false);

  const requestConfirmation = useCallback((options: ConfirmationOptions) => new Promise<boolean>((resolve) => {
    confirmationResolver.current?.(false);
    confirmationResolver.current = resolve;
    setConfirmation(options);
  }), []);

  const settleConfirmation = useCallback((value: boolean) => {
    confirmationResolver.current?.(value);
    confirmationResolver.current = null;
    setConfirmation(null);
  }, []);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!dirty || allowNavigation.current) return false;
    return currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search;
  });

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!state.authenticated) {
      setDirty(false);
      return;
    }
    if (!state.period) return;
    if (location.pathname === "/login" || !appPaths.has(location.pathname)) {
      navigate({ pathname: "/dashboard", search: state.periodSearch }, { replace: true });
    }
  }, [state.authenticated, state.period, state.periodSearch, location.pathname, navigate]);

  useEffect(() => {
    const label = titles[location.pathname] ?? (state.authenticated ? "Workspace" : "Sign in");
    document.title = `${label} · ${m.appName}`;
  }, [location.pathname, state.authenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const handleApplyPeriod = useCallback(async (startDate: string, endDate: string) => {
    if (startDate === state.period?.startDate && endDate === state.period?.endDate) return true;
    if (dirty) {
      const confirmed = await requestConfirmation({
        title: "Load a different reporting period?",
        description: "You have unsaved changes on this screen. Loading another period will discard them.",
        confirmLabel: "Discard and load",
        tone: "danger"
      });
      if (!confirmed) return false;
    }
    const prepared = await state.prepareRange(startDate, endDate);
    if (!prepared) return false;
    if (dirty) {
      allowNavigation.current = true;
      setDirty(false);
      window.setTimeout(() => { allowNavigation.current = false; }, 0);
    }
    state.applyRange(startDate, endDate);
    return true;
  }, [dirty, requestConfirmation, state.prepareRange, state.applyRange, state.period?.startDate, state.period?.endDate]);

  const handleSignOut = useCallback(async () => {
    if (dirty) {
      const confirmed = await requestConfirmation({
        title: "Sign out with unsaved changes?",
        description: "Your unsaved edits will be discarded when you sign out.",
        confirmLabel: "Discard and sign out",
        tone: "danger"
      });
      if (!confirmed) return;
    }
    allowNavigation.current = true;
    const success = await state.logout();
    if (success) {
      setDirty(false);
      window.setTimeout(() => { allowNavigation.current = false; }, 0);
    } else {
      allowNavigation.current = false;
    }
  }, [dirty, requestConfirmation, state.logout]);

  const unsavedValue = useMemo(() => ({ dirty, setDirty, requestConfirmation }), [dirty, requestConfirmation]);

  const settingsHref = `/settings${state.periodSearch}`;
  const signOut = () => { void handleSignOut(); };

  if (state.blockingLoading) return <LoadingState />;
  if (state.fatalError) return <ErrorState message={state.fatalError} retrying={state.retrying} onRetry={() => void state.retryLoad()} />;

  if (!state.authenticated) {
    return (
      <>
        <LoginView onLogin={state.login} loading={state.loggingIn} error={state.operationError} onClearError={state.dismissError} />
        <Toast notice={state.notice} onDismiss={state.dismissNotice} />
      </>
    );
  }

  if (!state.period) {
    return <ErrorState message={state.error || m.loadError} retrying={state.retrying} onRetry={() => void state.retryLoad()} />;
  }

  return (
    <UnsavedProvider value={unsavedValue}>
      <div className="min-h-dvh bg-canvas">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <p className="sr-only" role="status" aria-live="polite">{titles[location.pathname] ?? "Workspace"}</p>
        <Sidebar
          profile={state.profile}
          attentionCount={state.attentionCount}
          periodSearch={state.periodSearch}
          dailySearch={state.dailySearch}
          settingsHref={settingsHref}
          signingOut={state.loggingOut}
          onSignOut={signOut}
        />

        <div className="lg:pl-[264px]">
          <header className="sticky top-0 z-30 h-16 border-b border-line bg-surface/85 backdrop-blur">
            <div className="mx-auto flex h-full max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
              <IconButton label="Open navigation" className="shrink-0 lg:hidden" onClick={() => setDrawerOpen(true)} icon={<Menu className="size-5" aria-hidden="true" />} />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <PeriodSelector
                  period={state.period}
                  today={state.today}
                  preparing={state.refreshing}
                  error={state.refreshError}
                  onApply={handleApplyPeriod}
                />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[11px] font-medium text-muted md:flex">
                    <Globe2 className="size-3.5" aria-hidden="true" />
                    {state.profile.timezone}
                  </span>
                  <div className="lg:hidden">
                    <UserMenu name={state.profile.employeeName} position={state.profile.position} settingsHref={settingsHref} variant="compact" signingOut={state.loggingOut} onSignOut={signOut} />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main id="main-content" className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
            {state.error && (
              <InlineAlert tone="danger" className="mb-5" onDismiss={() => { state.dismissError(); state.refreshErrorDismiss(); }}>
                {state.error}
              </InlineAlert>
            )}

            <Suspense fallback={<PageSkeleton />}>
              <Routes>
              <Route path="/dashboard" element={
                <DashboardView
                  profile={state.profile}
                  period={state.period}
                  entries={state.entries}
                  completion={state.completion}
                  missingSummary={state.missingSummary}
                  totals={state.totals}
                  today={state.today}
                  onSelect={state.openDate}
                  onGoTo={state.goTo}
                />
              } />
              <Route path="/daily" element={state.currentRecord ? (
                <DailyEntryView
                  record={state.currentRecord}
                  profile={state.profile}
                  period={state.period}
                  dates={state.dates}
                  selectedDate={state.selectedDate}
                  today={state.today}
                  onDate={state.setSelectedDate}
                  onSave={state.saveDay}
                  onClear={state.clearDay}
                  saving={state.savingDay}
                  clearing={state.clearingDay}
                />
              ) : <ErrorState message={m.loadError} onRetry={() => void state.retryLoad()} />} />
              <Route path="/review" element={
                <ReviewView
                  period={state.period}
                  entries={state.entries}
                  completion={state.completion}
                  missingSummary={state.missingSummary}
                  nextMissing={state.nextMissing}
                  onSelect={state.openDate}
                  onGoTo={state.goTo}
                />
              } />
              <Route path="/leave" element={
                <LeaveView
                  leave={state.leave}
                  period={state.period}
                  today={state.today}
                  onSave={state.saveLeave}
                  onClear={state.clearLeave}
                  saving={state.savingLeave}
                  clearing={state.clearingLeave}
                />
              } />
              <Route path="/settings" element={<SettingsView profile={state.profile} onSave={state.saveProfile} saving={state.savingProfile} />} />
              <Route path="/exports" element={
                <ExportsView
                  period={state.period}
                  profile={state.profile}
                  records={state.records}
                  missingSummary={state.missingSummary}
                  nextMissing={state.nextMissing}
                  onSelect={state.openDate}
                  onGoTo={state.goTo}
                  notify={state.notify}
                />
              } />
              <Route path="/login" element={<Navigate to={`/dashboard${state.periodSearch}`} replace />} />
              <Route path="*" element={<Navigate to={`/dashboard${state.periodSearch}`} replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>

        <MobileNavigation
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          profile={state.profile}
          attentionCount={state.attentionCount}
          periodSearch={state.periodSearch}
          dailySearch={state.dailySearch}
          signingOut={state.loggingOut}
          onSignOut={signOut}
        />

        <Toast notice={state.notice} onDismiss={state.dismissNotice} />

        <ConfirmDialog
          open={Boolean(confirmation)}
          title={confirmation?.title ?? ""}
          description={confirmation?.description ?? ""}
          confirmLabel={confirmation?.confirmLabel}
          cancelLabel={confirmation?.cancelLabel}
          tone={confirmation?.tone}
          onConfirm={() => settleConfirmation(true)}
          onCancel={() => settleConfirmation(false)}
        />

        <ConfirmDialog
          open={blocker.state === "blocked"}
          title="Leave with unsaved changes?"
          description={`Your changes for ${formatRangeLabel(state.period.startDate, state.period.endDate)} have not been saved. Leaving this screen will discard them.`}
          confirmLabel="Discard and leave"
          tone="danger"
          onConfirm={() => { setDirty(false); blocker.proceed?.(); }}
          onCancel={() => blocker.reset?.()}
        />
      </div>
    </UnsavedProvider>
  );
};
