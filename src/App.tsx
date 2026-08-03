import { useState } from "react";
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

  if (state.loading) return <main className="loading">{m.appName}</main>;
  if (!state.authenticated) return <LoginView onLogin={state.login} error={state.error} />;
  if (state.error && !state.period) return <main className="loading"><p>{state.error}</p><Button onClick={() => void state.load()}>{m.save}</Button></main>;
  if (!state.period) return null;

  const openDate = (date: string) => { state.setSelectedDate(date); setView("daily"); };
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">D</div><div><strong>{m.appName}</strong><span>{m.appSubtitle}</span></div></div><nav>{navigation.map((item) => <button key={item.view} className={view === item.view ? "nav-item active" : "nav-item"} onClick={() => setView(item.view)}>{item.label}</button>)}</nav><div className="sidebar-footer">{state.profile.employeeName || m.missingName}</div></aside>
    <main className="main-content"><header className="topbar"><div><p className="eyebrow">{m.currentPeriod}</p><h1>{state.period.startDate}{m.periodRangeSeparator}{state.period.endDate}</h1></div><form className="cutoff-form" onSubmit={(event) => { event.preventDefault(); void state.load(state.cutoffStart, state.cutoffEnd); }}><label><span>{m.cutoffStart}</span><input value={state.cutoffStart} placeholder={m.dateFormat} aria-label={m.cutoffStart} onChange={(event) => state.setCutoffStart(event.target.value)} /></label><label><span>{m.cutoffEnd}</span><input value={state.cutoffEnd} placeholder={m.dateFormat} aria-label={m.cutoffEnd} onChange={(event) => state.setCutoffEnd(event.target.value)} /></label><Button type="submit">{m.applyCutoff}</Button></form><div className="topbar-actions"><span className="status-dot" /> {state.profile.timezone}</div></header>{state.notice && <div className="notice">{state.notice}</div>}{state.error && <div className="error-banner">{state.error}</div>}
      {view === "dashboard" && <DashboardView period={state.period} totals={state.totals} dates={state.dates} onSelect={openDate} />}
      {view === "daily" && state.currentRecord && <DailyEntryView record={state.currentRecord} dates={state.dates} selectedDate={state.selectedDate} onDate={state.setSelectedDate} onSave={state.saveDay} onClear={() => void state.clearDay()} />}
      {view === "review" && <ReviewView period={state.period} onSelect={openDate} />}
      {view === "leave" && <LeaveView leave={state.leave} setLeave={state.setLeave} onSave={() => void state.saveLeave()} onClear={() => void state.clearLeave()} />}
      {view === "settings" && <SettingsView profile={state.profile} setProfile={state.setProfile} onSave={() => void state.saveProfile()} />}
      {view === "exports" && <ExportsView periodId={state.period.id} />}
    </main>
  </div>;
};
