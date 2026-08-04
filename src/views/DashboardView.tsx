import type { Period } from "../api";
import { hours } from "../api";
import { messages as m } from "../constants/messages";
import { Button, Card } from "../components/ui";

type Totals = { regular: number; overtime: number; nightOt: number; rest: number };

export const DashboardView = ({ period, totals, dates, onSelect }: { period: Period; totals: Totals; dates: string[]; onSelect: (date: string) => void }) => {
  const entered = period.dailyRecords.length;
  const missing = dates.length - entered;
  return <div className="grid gap-5">
    <div className="flex items-end justify-between gap-[22px] rounded-[18px] border border-[#d9e7ff] bg-gradient-to-br from-[#eaf2ff] to-[#f6f9ff] p-7 max-[800px]:grid"><div><p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.appName}</p><h2 className="my-2 max-w-[540px] text-[25px] font-bold tracking-[-.03em] text-ink">{m.appSubtitle}</h2><p className="m-0 max-w-[600px] leading-relaxed text-[#65748b]">{m.heroHint}</p></div><Button onClick={() => onSelect(dates.find((date) => !period.dailyRecords.some((record) => record.workDate === date)) || dates[0])}>{m.dailyEntry}</Button></div>
    <div className="grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2">
      <Card><span className="text-xs text-[#72829a]">{m.completion}</span><strong className="mt-2 block text-[27px] font-bold tracking-[-.04em] text-ink">{Math.round((entered / dates.length) * 100)}%</strong><small className="text-[11px] text-[#8b98aa]">{entered} / {dates.length} {m.datesEntered}</small></Card>
      <Card><span className="text-xs text-[#72829a]">{m.regularHours}</span><strong className="mt-2 block text-[27px] font-bold tracking-[-.04em] text-ink">{hours(totals.regular)}</strong><small className="text-[11px] text-[#8b98aa]">{m.regularHours}</small></Card>
      <Card><span className="text-xs text-[#72829a]">{m.overtimeHours}</span><strong className="mt-2 block text-[27px] font-bold tracking-[-.04em] text-ink">{hours(totals.overtime)}</strong><small className="text-[11px] text-[#8b98aa]">{m.overtimeHours}</small></Card>
      <Card><span className="text-xs text-[#72829a]">{m.restDayHours}</span><strong className="mt-2 block text-[27px] font-bold tracking-[-.04em] text-ink">{hours(totals.rest)}</strong><small className="text-[11px] text-[#8b98aa]">{m.restDayHours}</small></Card>
    </div>
    <Card title={m.missingDays}><div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2.5">{dates.map((date) => { const record = period.dailyRecords.find((item) => item.workDate === date); return <button key={date} className={record ? "rounded-[10px] border border-emerald-200 bg-emerald-50 p-[11px] text-left text-emerald-700 hover:border-emerald-300" : "rounded-[10px] border border-slate-200 bg-slate-50 p-[11px] text-left text-slate-600 hover:border-brand"} onClick={() => onSelect(date)}><span className="block text-[13px] font-bold">{date}</span><small className="mt-1 block text-[11px] opacity-80">{record ? record.dayType.replace("_", " ") : m.notEntered}</small></button>; })}</div>{missing === 0 && <p className="mb-0 text-[13px] text-emerald-700">{m.allDatesEntered}</p>}</Card>
  </div>;
};
