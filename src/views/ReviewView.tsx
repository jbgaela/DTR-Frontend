import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Coffee, FileSpreadsheet, ListChecks, Plus, Sun, Table2 } from "lucide-react";
import type { DailyRecord, DayType, Period } from "../api";
import { Badge, Button, Card, CardHeader, EmptyState, InlineAlert, MetricCard, PageHeader, cn, type BadgeTone } from "../components/ui";
import { messages as m } from "../constants/messages";
import type { Completion, DateEntry, MissingSummary } from "../domain/period";
import { displayToIso, formatMonthDay, formatRangeLabel, formatWeekday, periodKindLabel } from "../domain/date";
import { dayTypeLabel, hours, pluralize } from "../domain/format";
import { sumRecords } from "../domain/records";

type ReviewFilter = "all" | "workday" | "rest" | "leave" | "overtime";

type ReviewViewProps = {
  period: Period;
  entries: DateEntry[];
  completion: Completion;
  missingSummary: MissingSummary;
  nextMissing: DateEntry | null;
  onSelect: (date: string) => void;
  onGoTo: (path: string) => void;
};

const dayTone = (type: DayType): BadgeTone => {
  switch (type) {
    case "WORKDAY": return "info";
    case "HOLIDAY": return "warning";
    case "LEAVE": return "brand";
    case "ABSENT": return "danger";
    default: return "neutral";
  }
};

const recordMatches = (record: DailyRecord, filter: ReviewFilter) => {
  if (filter === "all") return true;
  if (filter === "workday") return record.dayType === "WORKDAY";
  if (filter === "rest") return record.dayType === "REST_DAY";
  if (filter === "leave") return record.dayType === "LEAVE" || record.dayType === "ABSENT";
  return record.regularOtMinutes + record.nightDiffOtMinutes > 0;
};

const valueCells = [
  { key: "regularMinutes", label: "Regular" },
  { key: "regularOtMinutes", label: "Overtime" },
  { key: "nightDiffMinutes", label: "Night diff" },
  { key: "nightDiffOtMinutes", label: "Night OT" },
  { key: "restDayMinutes", label: "Rest day" },
  { key: "restDayOtMinutes", label: "Rest OT" },
  { key: "holidayMinutes", label: "Holiday" }
] as const;

export const ReviewView = ({ period, entries, completion, missingSummary, nextMissing, onSelect, onGoTo }: ReviewViewProps) => {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const savedRecords = useMemo(() => entries.flatMap((entry) => entry.record ? [entry.record] : []), [entries]);
  const totals = useMemo(() => sumRecords(savedRecords), [savedRecords]);
  const filtered = savedRecords.filter((record) => recordMatches(record, filter));
  const attention = missingSummary.missing + missingSummary.today;
  const filters: Array<{ key: ReviewFilter; label: string; count: number }> = [
    { key: "all", label: "All saved", count: savedRecords.length },
    { key: "workday", label: "Workdays", count: savedRecords.filter((record) => record.dayType === "WORKDAY").length },
    { key: "rest", label: "Rest days", count: savedRecords.filter((record) => record.dayType === "REST_DAY").length },
    { key: "leave", label: "Leave / absent", count: savedRecords.filter((record) => record.dayType === "LEAVE" || record.dayType === "ABSENT").length },
    { key: "overtime", label: "With overtime", count: savedRecords.filter((record) => record.regularOtMinutes + record.nightDiffOtMinutes > 0).length }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={m.periodReview}
        title="Review the reporting period"
        description={`${formatRangeLabel(period.startDate, period.endDate)} · ${periodKindLabel(period.startDate, period.endDate)} · ${completion.entered} of ${completion.total} dates entered.`}
        actions={
          <>
            <Button variant="secondary" icon={<FileSpreadsheet className="size-4" aria-hidden="true" />} onClick={() => onGoTo("/exports")}>Export workbooks</Button>
            {nextMissing && <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onSelect(nextMissing.date)}>Add missing entry</Button>}
          </>
        }
      />

      {attention > 0 ? (
        <InlineAlert
          tone="warning"
          title={attention === 1 ? "1 date still needs an entry" : `${attention} dates still need an entry`}
          action={<Button size="sm" variant="secondary" onClick={() => nextMissing && onSelect(nextMissing.date)}>Open next missing <ArrowRight className="size-3.5" aria-hidden="true" /></Button>}
        >
          {missingSummary.missing > 0 ? `${missingSummary.missing} past ${missingSummary.missing === 1 ? "date is" : "dates are"} missing a saved entry` : ""}
          {missingSummary.missing > 0 && missingSummary.today > 0 ? " and " : ""}
          {missingSummary.today > 0 ? "today is not saved yet" : ""}.
          {missingSummary.upcoming > 0 ? ` ${pluralize(missingSummary.upcoming, "upcoming date")} can be filled in early.` : ""}
        </InlineAlert>
      ) : missingSummary.upcoming > 0 ? (
        <InlineAlert tone="info" title={`${pluralize(missingSummary.upcoming, "upcoming date")} have no entry yet`}>All dates through today are saved. Upcoming dates remain optional until they arrive.</InlineAlert>
      ) : (
        <InlineAlert tone="success" title="Every date in this period is saved">The review below reflects the latest server-calculated values.</InlineAlert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard label="Saved records" value={savedRecords.length} hint={`${completion.total} dates in the period`} icon={<ListChecks className="size-[18px]" aria-hidden="true" />} tone="info" />
        <MetricCard label="Regular hours" value={hours(totals.regularMinutes)} unit="h" hint="Across saved records." icon={<Sun className="size-[18px]" aria-hidden="true" />} tone="info" />
        <MetricCard label="Overtime" value={hours(totals.overtimeMinutes)} unit="h" hint="Day overtime, excluding night OT." icon={<Clock3 className="size-[18px]" aria-hidden="true" />} tone="warning" />
        <MetricCard label="Rest-day hours" value={hours(totals.restDayMinutes)} unit="h" hint="Rest-day OT is listed separately." icon={<Coffee className="size-[18px]" aria-hidden="true" />} tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Saved entries"
          description="Filter the list or open any row to edit that date."
          action={<Badge tone="neutral">{filtered.length} of {savedRecords.length} shown</Badge>}
        />

        <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter saved entries">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                filter === item.key ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
              )}
            >
              {item.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular", filter === item.key ? "bg-black/20 text-white" : "bg-canvas text-muted")}>{item.count}</span>
            </button>
          ))}
        </div>

        {!savedRecords.length ? (
          <EmptyState
            icon={<CalendarDays className="size-5" aria-hidden="true" />}
            title="No daily entries yet"
            description="Saved dates will appear here with the exact hourly categories returned by the server."
            action={<Button size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onSelect(nextMissing?.date ?? period.startDate)}>Add the first entry</Button>}
          />
        ) : !filtered.length ? (
          <EmptyState icon={<Table2 className="size-5" aria-hidden="true" />} title="No entries match this filter" description="Choose another filter to see the saved records in this period." action={<Button size="sm" variant="secondary" onClick={() => setFilter("all")}>Show all saved</Button>} />
        ) : (
          <>
            <div className="relative hidden w-full max-w-full overflow-x-auto md:block">
              <table className="w-full min-w-[920px] border-collapse text-[13px]">
                <caption className="sr-only">Saved daily entries for the selected reporting period</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[.06em] text-muted">Date</th>
                    <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[.06em] text-muted">Day type</th>
                    {valueCells.map((cell) => <th key={cell.key} scope="col" className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[.06em] text-muted">{cell.label}</th>)}
                    <th scope="col" className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[.06em] text-muted"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id} className="border-b border-line/70 transition-colors last:border-0 hover:bg-canvas/70">
                      <th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-medium">
                        <time dateTime={displayToIso(record.workDate)} className="block font-semibold text-ink">{formatMonthDay(record.workDate)}</time>
                        <span className="mt-0.5 block text-[11px] font-normal text-muted">{formatWeekday(record.workDate, "long")}</span>
                      </th>
                      <td className="whitespace-nowrap px-3 py-3"><Badge tone={dayTone(record.dayType)}>{dayTypeLabel(record.dayType)}</Badge></td>
                      {valueCells.map((cell) => <td key={cell.key} className="whitespace-nowrap px-3 py-3 text-right font-medium text-ink tabular">{hours(record[cell.key])}</td>)}
                      <td className="px-3 py-3 text-right"><Button size="sm" variant="ghost" aria-label={`Edit entry for ${formatMonthDay(record.workDate)}`} onClick={() => onSelect(record.workDate)}>Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {filtered.map((record) => (
                <article key={record.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{formatMonthDay(record.workDate)} <span className="font-normal text-muted">· {formatWeekday(record.workDate)}</span></h3>
                      <div className="mt-1"><Badge tone={dayTone(record.dayType)}>{dayTypeLabel(record.dayType)}</Badge></div>
                    </div>
                    <Button size="sm" variant="secondary" aria-label={`Edit entry for ${formatMonthDay(record.workDate)}`} onClick={() => onSelect(record.workDate)}>Edit</Button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-[12px]">
                    {valueCells.map((cell) => (
                      <div key={cell.key} className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{cell.label}</dt>
                        <dd className="font-semibold text-ink tabular">{hours(record[cell.key])}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">Night differential and night OT are separate server categories. Night OT is included within total overtime work but is not added into the day-overtime figure above; rest-day OT is listed separately from rest-day hours.</p>
          </>
        )}
      </Card>
    </div>
  );
};
