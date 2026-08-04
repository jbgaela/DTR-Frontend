import { useState } from "react";
import { LoadingState } from "./components/LoadingState";
import { Button } from "./components/ui";
import { messages as m } from "./constants/messages";
import { useDtrApp } from "./hooks/useDtrApp";
import { DailyEntryView } from "./views/DailyEntryView";
import { DashboardView } from "./views/DashboardView";
import { ExportsView } from "./views/ExportsView";
import { LeaveView } from "./views/LeaveView";
import { ReviewView } from "./views/ReviewView";
import { SettingsView } from "./views/SettingsView";
import { LoginView } from "./views/LoginView";

type View = "dashboard" | "daily" | "review" | "leave" | "settings" | "exports";

const navigation: Array<{ view: View; label: string }> = [
  { view: "dashboard", label: m.dashboard },
  { view: "daily", label: m.dailyEntry },
  { view: "review", label: m.periodReview },
  { view: "leave", label: m.leave },
  { view: "settings", label: m.settings },
  { view: "exports", label: m.exports }
];

export const App = () => {
  const [view, setView] = useState<View>("dashboard");
  const state = useDtrApp();

  if (state.blockingLoading) return <LoadingState />;
  if (state.fatalError) return <main className="grid min-h-screen min-h-[100dvh] place-items-center bg-app p-6"><section className="w-full max-w-[460px] rounded-[20px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_50px_rgb(32_53_93/5%)]"><div className="mx-auto mb-[18px] grid size-[38px] place-items-center rounded-xl bg-brand text-xl font-extrabold text-white" aria-hidden="true">D</div><p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.appName}</p><h1 className="my-2 mb-[18px] text-2xl font-bold tracking-[-.04em] text-ink">{m.loadErrorTitle}</h1><p className="mb-[17px] rounded-lg bg-red-50 px-3.5 py-[11px] text-left text-[13px] text-red-700" role="alert">{state.fatalError}</p><Button onClick={() => void state.retryLoad()}>{m.retry}</Button></section></main>;
  if (!state.authenticated) return <LoginView onLogin={state.login} error={state.error} />;
  if (!state.period) return null;

  const openDate = (date: string) => { state.setSelectedDate(date); setView("daily"); };
  return <div className="flex min-h-screen bg-app max-[800px]:block">
    <aside className="flex w-[250px] shrink-0 flex-col gap-9 bg-sidebar p-6 px-4 text-[#dbe7fa] max-[800px]:block max-[800px]:w-full max-[800px]:gap-4 max-[800px]:p-3.5"><div className="flex items-center gap-2.5"><div className="grid size-[38px] place-items-center rounded-xl bg-brand text-xl font-extrabold text-white">D</div><div><strong className="block text-sm text-white">{m.appName}</strong><span className="mt-0.5 block text-[11px] leading-tight text-[#9fb1cd]">{m.appSubtitle}</span></div></div><nav className="grid gap-1.5 max-[800px]:flex max-[800px]:overflow-x-auto">{navigation.map((item) => <button key={item.view} className={`rounded-lg border-0 bg-transparent px-[13px] py-2.5 text-left text-sm text-[#aebdd4] hover:bg-[#223a60] hover:text-white max-[800px]:whitespace-nowrap ${view === item.view ? "bg-[#223a60] text-white" : ""}`} onClick={() => setView(item.view)}>{item.label}</button>)}</nav><div className="mt-auto break-words border-t border-[#294265] px-1.5 pt-4 text-xs text-[#9fb1cd] max-[800px]:hidden">{state.profile.employeeName || m.missingName}</div></aside>
    <main className="mx-auto w-full max-w-[1180px] px-9 pb-16 pt-7 max-[800px]:px-[15px] max-[800px]:pb-[45px] max-[800px]:pt-[22px]"><header className="mb-[30px] flex items-center justify-between max-[800px]:flex-wrap max-[800px]:items-start max-[800px]:gap-2.5"><div><p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.currentPeriod}</p><h1 className="mt-1 text-[27px] font-bold tracking-[-.03em] text-ink max-[800px]:text-xl">{state.period.startDate}{m.periodRangeSeparator}{state.period.endDate}</h1></div><form className="flex items-end gap-2 max-[800px]:w-full max-[800px]:flex-wrap" onSubmit={(event) => { event.preventDefault(); void state.refreshPeriod(state.cutoffStart, state.cutoffEnd); }}><label className="grid gap-1 text-[10px] font-bold text-[#687891]"><span>{m.cutoffStart}</span><input className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400 max-[800px]:w-[140px]" disabled={state.refreshing} value={state.cutoffStart} placeholder={m.dateFormat} aria-label={m.cutoffStart} onChange={(event) => state.setCutoffStart(event.target.value)} /></label><label className="grid gap-1 text-[10px] font-bold text-[#687891]"><span>{m.cutoffEnd}</span><input className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400 max-[800px]:w-[140px]" disabled={state.refreshing} value={state.cutoffEnd} placeholder={m.dateFormat} aria-label={m.cutoffEnd} onChange={(event) => state.setCutoffEnd(event.target.value)} /></label><Button className="px-3 py-2 text-xs" disabled={state.refreshing} type="submit">{state.refreshing ? m.loadingCutoff : m.applyCutoff}</Button></form><div className="flex items-center gap-1.5 text-[13px] text-[#687891] max-[800px]:text-[11px]"><span className="size-2 rounded-full bg-emerald-500" /> {state.profile.timezone}</div></header>{state.notice && <div className="mb-[17px] rounded-lg bg-emerald-50 px-3.5 py-[11px] text-[13px] text-emerald-700">{state.notice}</div>}{state.error && <div className="mb-[17px] rounded-lg bg-red-50 px-3.5 py-[11px] text-[13px] text-red-700" role="alert">{state.error}</div>}
      {view === "dashboard" && <DashboardView period={state.period} totals={state.totals} dates={state.dates} onSelect={openDate} />}
      {view === "daily" && state.currentRecord && <DailyEntryView record={state.currentRecord} dates={state.dates} selectedDate={state.selectedDate} onDate={state.setSelectedDate} onSave={state.saveDay} onClear={() => void state.clearDay()} saving={state.savingDay} clearing={state.clearingDay} />}
      {view === "review" && <ReviewView period={state.period} onSelect={openDate} />}
      {view === "leave" && <LeaveView leave={state.leave} onSave={state.saveLeave} onClear={state.clearLeave} saving={state.savingLeave} clearing={state.clearingLeave} />}
      {view === "settings" && <SettingsView profile={state.profile} onSave={state.saveProfile} saving={state.savingProfile} />}
      {view === "exports" && <ExportsView periodId={state.period.id} />}
    </main>
  </div>;
};
