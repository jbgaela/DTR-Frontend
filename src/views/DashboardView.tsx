import type { Period } from "../api";
import { hours } from "../api";
import { messages as m } from "../constants/messages";
import { Button, Card } from "../components/ui";

type Totals = { regular: number; overtime: number; nightOt: number; rest: number };

export const DashboardView = ({ period, totals, dates, onSelect }: { period: Period; totals: Totals; dates: string[]; onSelect: (date: string) => void }) => {
  const entered = period.dailyRecords.length;
  const missing = dates.length - entered;
  return <div className="stack">
    <div className="hero"><div><p className="eyebrow">{m.appName}</p><h2>{m.appSubtitle}</h2><p className="muted">{m.heroHint}</p></div><Button onClick={() => onSelect(dates.find((date) => !period.dailyRecords.some((record) => record.workDate === date)) || dates[0])}>{m.dailyEntry}</Button></div>
    <div className="stat-grid">
      <Card><span className="stat-label">{m.completion}</span><strong>{Math.round((entered / dates.length) * 100)}%</strong><small>{entered} / {dates.length} {m.datesEntered}</small></Card>
      <Card><span className="stat-label">{m.regularHours}</span><strong>{hours(totals.regular)}</strong><small>{m.regularHours}</small></Card>
      <Card><span className="stat-label">{m.overtimeHours}</span><strong>{hours(totals.overtime)}</strong><small>{m.overtimeHours}</small></Card>
      <Card><span className="stat-label">{m.restDayHours}</span><strong>{hours(totals.rest)}</strong><small>{m.restDayHours}</small></Card>
    </div>
    <Card title={m.missingDays}><div className="date-grid">{dates.map((date) => { const record = period.dailyRecords.find((item) => item.workDate === date); return <button key={date} className={record ? "date-chip complete" : "date-chip"} onClick={() => onSelect(date)}><span>{date}</span><small>{record ? record.dayType.replace("_", " ") : m.notEntered}</small></button>; })}</div>{missing === 0 && <p className="success-copy">{m.allDatesEntered}</p>}</Card>
  </div>;
};
