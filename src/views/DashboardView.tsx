import { AlertCircle, ArrowRight, CalendarCheck2, CalendarDays, CheckCircle2, Clock3, Coffee, ListChecks, MoonStar, Plus, Sun } from "lucide-react";
import type { Period, Profile } from "../api";
import { Badge, Button, Card, CardHeader, EmptyState, MetricCard, PageHeader, ProgressBar, ProgressRing, cn } from "../components/ui";
import type { Completion, DateEntry, MissingSummary } from "../domain/period";
import type { HourTotals } from "../domain/records";
import { compareDisplayDates, formatLongDate, formatMonthDay, formatRangeLabel, formatWeekday, periodKindLabel } from "../domain/date";
import { dayTypeLabel, firstName, formatClock, hours, pluralize } from "../domain/format";

type DashboardViewProps = {
  profile: Profile;
  period: Period;
  entries: DateEntry[];
  completion: Completion;
  missingSummary: MissingSummary;
  totals: HourTotals;
  today: string;
  onSelect: (date: string) => void;
  onGoTo: (path: string) => void;
};

const greetingFor = (timezone: string) => {
  try {
    const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  } catch {
    return "Welcome back";
  }
};

const DateTile = ({ entry, onSelect }: { entry: DateEntry; onSelect: (date: string) => void }) => {
  const statusLabel = entry.status === "saved" ? dayTypeLabel(entry.record!.dayType) : entry.status === "today" ? "Today · missing" : entry.status === "missing" ? "Missing entry" : "Upcoming";
  const icon = entry.status === "saved"
    ? <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
    : entry.status === "today"
      ? <Clock3 className="size-4 text-brand" aria-hidden="true" />
      : entry.status === "missing"
        ? <AlertCircle className="size-4 text-warning" aria-hidden="true" />
        : <span className="size-4 rounded-full border border-line-strong" aria-hidden="true" />;
  return (
    <button
      type="button"
      onClick={() => onSelect(entry.date)}
      className={cn(
        "group relative flex min-h-[104px] flex-col justify-between rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        entry.status === "saved" && "border-success/20 bg-success-soft/60 hover:border-success/40",
        entry.status === "missing" && "border-warning/25 bg-warning-soft/70 hover:border-warning/50",
        entry.status === "today" && "border-brand/30 bg-brand-soft/70 ring-2 ring-brand/15 hover:border-brand/50",
        entry.status === "upcoming" && "border-line bg-surface hover:border-line-strong hover:bg-canvas/60"
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[.1em] text-muted">{formatWeekday(entry.date)}</span>
        {icon}
      </span>
      <span className="mt-1 block text-[15px] font-semibold tracking-[-.01em] text-ink">{formatMonthDay(entry.date)}</span>
      <span className={cn("mt-1 block text-[11px] font-medium", entry.status === "saved" ? "text-success" : entry.status === "missing" || entry.status === "today" ? "text-warning" : "text-muted")}>{statusLabel}</span>
      <span className="sr-only">Open daily entry</span>
    </button>
  );
};

export const DashboardView = ({ profile, period, entries, completion, missingSummary, totals, today, onSelect, onGoTo }: DashboardViewProps) => {
  const saved = entries.filter((entry) => entry.record).sort((left, right) => compareDisplayDates(right.date, left.date));
  const nextAction = entries.find((entry) => entry.status === "missing") ?? entries.find((entry) => entry.status === "today") ?? null;
  const todayEntry = entries.find((entry) => entry.date === today);
  const primaryDate = nextAction?.date ?? todayEntry?.date ?? entries[0]?.date ?? period.startDate;
  const periodKind = periodKindLabel(period.startDate, period.endDate);
  const missingCount = missingSummary.missing + missingSummary.today;
  const futureOnly = entries.length > 0 && entries.every((entry) => entry.status === "upcoming");
  const greeting = greetingFor(profile.timezone);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title={`${greeting}, ${firstName(profile.employeeName) || "there"}`}
        description={`${formatRangeLabel(period.startDate, period.endDate)} · ${periodKind}. Here is where your attendance stands.`}
        actions={
          <>
            <Button variant="secondary" icon={<ListChecks className="size-4" aria-hidden="true" />} onClick={() => onGoTo("/review")}>Review period</Button>
            <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onSelect(primaryDate)}>{nextAction ? "Add daily entry" : "Open daily entry"}</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand-soft/80 blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={completion.percent} label="Period completion" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{periodKind}</Badge>
                {futureOnly ? <Badge tone="info"><CalendarDays className="size-3" aria-hidden="true" /> Upcoming</Badge> : missingCount === 0 ? <Badge tone="success"><CheckCircle2 className="size-3" aria-hidden="true" /> Up to date</Badge> : <Badge tone="warning"><AlertCircle className="size-3" aria-hidden="true" /> {pluralize(missingCount, "missing date")}</Badge>}
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-[-.02em] text-ink">{Math.round(completion.percent)}% complete</h2>
              <p className="mt-1 text-sm text-muted">{completion.entered} of {completion.total} dates entered in this period.</p>
              <ProgressBar value={completion.percent} label="Dates entered in this reporting period" className="mt-4" />
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
                <div><dt className="text-[11px] font-medium text-muted">Entered</dt><dd className="mt-0.5 text-lg font-semibold text-ink tabular">{completion.entered}</dd></div>
                <div><dt className="text-[11px] font-medium text-muted">Missing</dt><dd className="mt-0.5 text-lg font-semibold text-warning tabular">{missingCount}</dd></div>
                <div><dt className="text-[11px] font-medium text-muted">Upcoming</dt><dd className="mt-0.5 text-lg font-semibold text-ink tabular">{missingSummary.upcoming}</dd></div>
              </dl>
            </div>
          </div>
        </Card>

        {nextAction ? (
          <section className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-strong p-5 text-white surface-shadow sm:p-6">
            <div className="pointer-events-none absolute -bottom-20 -right-16 size-52 rounded-full border-[30px] border-white/10" aria-hidden="true" />
            <div className="relative flex flex-1 flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-white">
                <CalendarCheck2 className="size-3" aria-hidden="true" /> Next action
              </span>
              <h2 className="mt-4 text-xl font-semibold tracking-[-.03em] text-white">{nextAction.status === "today" ? "Today's entry is open" : "A date is missing an entry"}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">{formatLongDate(nextAction.date)}{nextAction.status === "today" ? " is today." : " has no saved attendance yet."}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                <Button variant="secondary" className="border-0 bg-white text-brand hover:bg-white/90" icon={<ArrowRight className="size-4" aria-hidden="true" />} onClick={() => onSelect(nextAction.date)}>Record entry</Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => onGoTo("/daily")}>Choose another date</Button>
              </div>
            </div>
          </section>
        ) : futureOnly ? (
          <section className="flex flex-col rounded-2xl border border-brand/15 bg-brand-soft p-5 surface-shadow sm:p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-surface text-brand" aria-hidden="true"><CalendarDays className="size-5" /></span>
            <h2 className="mt-4 text-lg font-semibold tracking-[-.02em] text-ink">This cutoff is upcoming</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">No dates are due yet. You can still record entries early for {pluralize(entries.length, "date")} in this period.</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onSelect(primaryDate)}>Open daily entry</Button>
              <Button variant="ghost" onClick={() => onGoTo("/review")}>Review period</Button>
            </div>
          </section>
        ) : (
          <section className="flex flex-col rounded-2xl border border-success/20 bg-success-soft p-5 surface-shadow sm:p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-surface text-success" aria-hidden="true"><CheckCircle2 className="size-5" /></span>
            <h2 className="mt-4 text-lg font-semibold tracking-[-.02em] text-ink">Every date through today is entered</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {missingSummary.upcoming > 0 ? `${pluralize(missingSummary.upcoming, "upcoming date")} can still be filled in early.` : "This reporting period is fully covered."}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button variant="secondary" icon={<ListChecks className="size-4" aria-hidden="true" />} onClick={() => onGoTo("/review")}>Review period</Button>
              <Button variant="ghost" onClick={() => onGoTo("/exports")}>Go to exports</Button>
            </div>
          </section>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard label="Regular hours" value={hours(totals.regularMinutes)} unit="h" hint="Ordinary time across saved entries." icon={<Sun className="size-[18px]" aria-hidden="true" />} tone="info" />
        <MetricCard label="Overtime" value={hours(totals.overtimeMinutes)} unit="h" hint="Day overtime; night OT is shown separately." icon={<Clock3 className="size-[18px]" aria-hidden="true" />} tone="info" />
        <MetricCard label="Night OT" value={hours(totals.nightOtMinutes)} unit="h" hint="Overtime worked in the night window." icon={<MoonStar className="size-[18px]" aria-hidden="true" />} tone="warning" />
        <MetricCard label="Rest-day hours" value={hours(totals.restDayMinutes)} unit="h" hint={totals.restDayOtMinutes ? `${hours(totals.restDayOtMinutes)} h rest-day OT recorded separately.` : "Rest-day time before the 8-hour mark."} icon={<Coffee className="size-[18px]" aria-hidden="true" />} tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Date overview"
          description="Select any date to record or review its entry. Saved rest days count as complete, even with zero worked hours."
          action={
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted" aria-label="Date status legend">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" aria-hidden="true" /> Saved</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" aria-hidden="true" /> Missing</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border border-line-strong bg-surface" aria-hidden="true" /> Upcoming</span>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {entries.map((entry) => <DateTile key={entry.date} entry={entry} onSelect={onSelect} />)}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent entries"
            description="The latest saved dates in this period."
            action={<Button variant="ghost" size="sm" onClick={() => onGoTo("/review")}>View all <ArrowRight className="size-3.5" aria-hidden="true" /></Button>}
          />
          {saved.length ? (
            <ul className="divide-y divide-line">
              {saved.slice(0, 4).map((entry) => (
                <li key={entry.date}>
                  <button type="button" onClick={() => onSelect(entry.date)} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><CalendarDays className="size-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-ink">{formatMonthDay(entry.date)} <span className="font-normal text-muted">· {formatWeekday(entry.date, "long")}</span></span>
                      <span className="mt-0.5 block text-[11px] text-muted">{entry.record ? dayTypeLabel(entry.record.dayType) : ""} · {formatClock(entry.record?.clockInMinute ?? null)} – {formatClock(entry.record?.clockOutMinute ?? null)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-semibold text-ink tabular">{hours(entry.record?.regularMinutes ?? 0)} h</span>
                      <span className="mt-0.5 block text-[11px] text-muted">regular</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<CalendarDays className="size-5" aria-hidden="true" />} title="No saved entries yet" description="Choose a date from the overview to record your first attendance and accomplishments." action={<Button size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => onSelect(primaryDate)}>Add daily entry</Button>} />
          )}
        </Card>

        <Card>
          <CardHeader title="Period summary" description="Every category is displayed exactly as the server calculated it." />
          <dl className="divide-y divide-line text-[13px]">
            {[
              { label: "Regular", value: totals.regularMinutes },
              { label: "Overtime", value: totals.overtimeMinutes },
              { label: "Night differential", value: totals.nightDiffMinutes },
              { label: "Night OT", value: totals.nightOtMinutes },
              { label: "Rest day", value: totals.restDayMinutes },
              { label: "Rest-day OT", value: totals.restDayOtMinutes },
              { label: "Holiday", value: totals.holidayMinutes }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5">
                <dt className="text-muted">{item.label}</dt>
                <dd className="font-semibold text-ink tabular">{hours(item.value)} h</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">Night OT is a subset of overtime, and rest-day OT is separate from rest-day hours. No categories are added together here.</p>
        </Card>
      </div>
    </div>
  );
};
