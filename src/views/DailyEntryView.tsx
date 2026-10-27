import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, Save, Trash2, TriangleAlert } from "lucide-react";
import type { DailyHours, DailyRecord, DailyRecordInput, Profile, Period } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Badge, Button, Card, CardHeader, CheckboxField, InlineAlert, PageHeader, SelectField, TextField, TextareaField, IconButton, cn } from "../components/ui";
import { usePageDirty } from "../components/unsaved";
import { messages as m } from "../constants/messages";
import { applyShiftFallback, dailyFormSignature, dailyPayload, dailyPreviewInput, hasShiftFallback, overrideFields, recordStatus, taskLines, toDailyForm, type DailyForm, type OverrideKey } from "../domain/daily";
import { displayToIso, formatLongDate, formatRangeLabel, isoToDisplay, periodKindLabel } from "../domain/date";
import { dayTypeLabel, formatClock, hours } from "../domain/format";
import { blankRecord, shiftDefaults, toHours, type DailyRecordValue } from "../domain/records";
import { firstErrorKey, validateDaily, type FieldErrors } from "../domain/validation";
import { useDailyHoursPreview } from "../hooks/useDailyHoursPreview";

type DailyEntryViewProps = {
  record: DailyRecordValue;
  profile: Profile;
  period: Period;
  dates: string[];
  selectedDate: string;
  today: string;
  onDate: (date: string) => void;
  onSave: (record: DailyRecordInput) => Promise<DailyRecord | null>;
  onClear: () => Promise<boolean>;
  saving: boolean;
  clearing: boolean;
};

const recordIdentity = (record: DailyRecordValue) => recordStatus(record) === "saved" ? (record as DailyRecord).id : "new";

const summaryRows = (value: DailyHours | null) => [
  { key: "regularMinutes", label: m.regularHours, value: value?.regularMinutes },
  { key: "regularOtMinutes", label: m.overtimeHours, value: value?.regularOtMinutes },
  { key: "nightDiffMinutes", label: m.nightDiffHours, value: value?.nightDiffMinutes },
  { key: "nightDiffOtMinutes", label: m.nightOtHours, value: value?.nightDiffOtMinutes },
  { key: "restDayMinutes", label: m.restDayHours, value: value?.restDayMinutes },
  { key: "restDayOtMinutes", label: m.restDayOtHours, value: value?.restDayOtMinutes },
  { key: "holidayMinutes", label: m.holidayHours, value: value?.holidayMinutes }
];

const fieldIdFor = (key: string) => overrideFields.some((field) => field.key === key) ? `daily-override-${key}` : `daily-${key}`;

export const DailyEntryView = ({ record, profile, period, dates, selectedDate, today, onDate, onSave, onClear, saving, clearing }: DailyEntryViewProps) => {
  const [form, setForm] = useState<DailyForm>(() => toDailyForm(record));
  const [baseline, setBaseline] = useState<DailyForm>(() => toDailyForm(record));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(() => {
    const input = dailyPreviewInput(toDailyForm(record));
    return { signature: JSON.stringify(input), hours: toHours(record) };
  });
  const identity = recordIdentity(record);

  useEffect(() => {
    const next = toDailyForm(record);
    setForm(next);
    setBaseline(next);
    setErrors({});
    setDeleteOpen(false);
    setConfirmed({ signature: JSON.stringify(dailyPreviewInput(toDailyForm(record))), hours: toHours(record) });
  }, [period.id, selectedDate, identity]);

  const dirty = dailyFormSignature(form) !== dailyFormSignature(baseline);
  usePageDirty(dirty);

  const setField = <K extends keyof DailyForm,>(key: K, value: DailyForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const effectiveForm = useMemo(() => applyShiftFallback(form, profile), [form, profile]);
  const previewInput = useMemo(() => dailyPreviewInput(effectiveForm), [effectiveForm]);
  const preview = useDailyHoursPreview(previewInput);
  const inputSignature = JSON.stringify(previewInput);
  const saved = recordStatus(record) === "saved";
  const showingConfirmed = saved && inputSignature === confirmed.signature;
  const displayHours = showingConfirmed ? confirmed.hours : preview.hours;
  const timeDisabled = form.dayType === "LEAVE" || form.dayType === "ABSENT";
  const usingShiftFallback = hasShiftFallback(form);
  const selectedIndex = dates.indexOf(selectedDate);
  const previousDate = selectedIndex > 0 ? dates[selectedIndex - 1] : null;
  const nextDate = selectedIndex >= 0 && selectedIndex < dates.length - 1 ? dates[selectedIndex + 1] : null;
  const tasks = taskLines(form.tasksText);
  const invalidCount = Object.keys(errors).length;
  const workdayShortfall = Boolean(displayHours && effectiveForm.dayType === "WORKDAY" && effectiveForm.clockInMinute !== null && effectiveForm.clockOutMinute !== null && displayHours.regularMinutes < 480);
  const canPreview = preview.enabled;
  const previewLabel = showingConfirmed ? "Saved" : preview.state === "calculating" ? "Calculating" : preview.state === "error" ? "Unavailable" : canPreview ? "Preview" : "No preview";

  const setOverride = (key: OverrideKey, value: number) => setForm((current) => ({ ...current, override: { ...current.override, [key]: value } }));

  const changeDayType = (value: DailyForm["dayType"]) => {
    setForm((current) => ({
      ...current,
      dayType: value,
      ...(value === "WORKDAY" && current.clockInMinute === null && current.clockOutMinute === null ? shiftDefaults(profile) : {}),
      breakMinutes: value === "WORKDAY" && current.breakMinutes === 0 ? profile.standardBreakMinutes : current.breakMinutes
    }));
  };

  const useShiftTimes = () => setForm((current) => ({ ...current, ...shiftDefaults(profile) }));

  const reset = () => {
    setForm(baseline);
    setErrors({});
  };

  const handleSave = async () => {
    const formToSave = applyShiftFallback(form, profile);
    const nextErrors = validateDaily(formToSave);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = firstErrorKey(nextErrors);
      if (first) window.requestAnimationFrame(() => document.getElementById(fieldIdFor(first))?.focus());
      return;
    }
    const savedRecord = await onSave(dailyPayload(formToSave));
    if (savedRecord) {
      const next = toDailyForm(savedRecord);
      setForm(next);
      setBaseline(next);
      setConfirmed({ signature: JSON.stringify(dailyPreviewInput(toDailyForm(savedRecord))), hours: toHours(savedRecord) });
      setErrors({});
    }
  };

  const handleDelete = async () => {
    const deleted = await onClear();
    if (deleted) {
      const blank = blankRecord(selectedDate, profile);
      const next = toDailyForm(blank);
      setForm(next);
      setBaseline(next);
      setConfirmed({ signature: JSON.stringify(dailyPreviewInput(toDailyForm(blank))), hours: toHours(blank) });
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={m.dailyEntry}
        title={formatLongDate(selectedDate)}
        description={`${formatRangeLabel(period.startDate, period.endDate)} · ${periodKindLabel(period.startDate, period.endDate)} · Times use ${profile.timezone}.`}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <IconButton label="Previous date" variant="secondary" icon={<ChevronLeft className="size-4" aria-hidden="true" />} disabled={!previousDate} onClick={() => previousDate && onDate(previousDate)} />
            <label className="sr-only" htmlFor="daily-date">Selected date</label>
            <input
              id="daily-date"
              type="date"
              value={displayToIso(selectedDate)}
              min={displayToIso(period.startDate)}
              max={displayToIso(period.endDate)}
              onChange={(event) => { const date = isoToDisplay(event.target.value); if (date && dates.includes(date)) onDate(date); }}
              className="min-h-10 rounded-lg border border-line bg-surface px-2.5 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            <IconButton label="Next date" variant="secondary" icon={<ChevronRight className="size-4" aria-hidden="true" />} disabled={!nextDate} onClick={() => nextDate && onDate(nextDate)} />
            {dates.includes(today) && selectedDate !== today && <Button variant="secondary" size="sm" onClick={() => onDate(today)}>Today</Button>}
          </div>
        }
      />

      {invalidCount > 0 && (
        <InlineAlert tone="danger" title="Check the highlighted fields">
          {invalidCount === 1 ? "One field needs attention before this entry can be saved." : `${invalidCount} fields need attention before this entry can be saved.`}
        </InlineAlert>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title={m.attendance}
              description="New workdays default to your shift start and end. Both times remain editable."
              action={<Badge tone={dirty || usingShiftFallback ? "warning" : saved ? "success" : "neutral"}>{dirty ? "Unsaved changes" : saved && usingShiftFallback ? "Saved without times" : saved ? "Saved entry" : "New entry"}</Badge>}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="daily-dayType" label={m.dayType} value={form.dayType} onChange={(event) => changeDayType(event.target.value as DailyForm["dayType"])} error={errors.dayType} required>
                {(["WORKDAY", "REST_DAY", "HOLIDAY", "LEAVE", "ABSENT"] as const).map((type) => <option key={type} value={type}>{dayTypeLabel(type)}</option>)}
              </SelectField>
              <SelectField id="daily-calculationMode" label={m.calculation} value={form.calculationMode} onChange={(event) => setField("calculationMode", event.target.value as DailyForm["calculationMode"])} hint={form.calculationMode === "AUTO" ? "The server calculates all categories from the times." : "Enter the seven hour categories yourself."}>
                <option value="AUTO">{m.automatic}</option>
                <option value="OVERRIDE">{m.override}</option>
              </SelectField>
              <TextField
                id="daily-clockInMinute"
                label={m.timeIn}
                type="time"
                value={form.clockInMinute === null ? "" : `${String(Math.floor(form.clockInMinute / 60)).padStart(2, "0")}:${String(form.clockInMinute % 60).padStart(2, "0")}`}
                onChange={(event) => setField("clockInMinute", event.target.value ? Number(event.target.value.slice(0, 2)) * 60 + Number(event.target.value.slice(3, 5)) : null)}
                disabled={timeDisabled}
                error={errors.clockInMinute}
              />
              <TextField
                id="daily-clockOutMinute"
                label={m.timeOut}
                type="time"
                value={form.clockOutMinute === null ? "" : `${String(Math.floor(form.clockOutMinute / 60)).padStart(2, "0")}:${String(form.clockOutMinute % 60).padStart(2, "0")}`}
                onChange={(event) => setField("clockOutMinute", event.target.value ? Number(event.target.value.slice(0, 2)) * 60 + Number(event.target.value.slice(3, 5)) : null)}
                disabled={timeDisabled}
                error={errors.clockOutMinute}
              />
              <TextField
                id="daily-breakMinutes"
                label={m.breakMinutes}
                type="number"
                min={0}
                max={720}
                step={1}
                value={form.breakMinutes}
                onChange={(event) => setField("breakMinutes", Number(event.target.value))}
                hint="Unpaid break is subtracted from the time between in and out."
                error={errors.breakMinutes}
                disabled={timeDisabled}
              />
              <div className="flex items-end pb-1">
                <CheckboxField label={m.overnight} hint="Use this when the shift ends after midnight." checked={form.endsNextDay} onChange={(event) => setField("endsNextDay", event.target.checked)} disabled={timeDisabled} />
              </div>
            </div>
            {usingShiftFallback && (
              <div className="mt-4 flex flex-col gap-2.5 rounded-lg border border-brand/15 bg-brand-soft px-3.5 py-3 text-[12px] leading-relaxed text-brand sm:flex-row sm:items-center sm:justify-between">
                <p>No time in or time out entered. Shift hours ({formatClock(profile.shiftStartMinute)} – {formatClock(profile.shiftEndMinute)}) will be used for preview and save.</p>
                <Button size="sm" variant="secondary" onClick={useShiftTimes}>Use shift times</Button>
              </div>
            )}
            {timeDisabled && <p className="mt-4 rounded-lg bg-brand-soft px-3.5 py-2.5 text-[12px] leading-relaxed text-brand">{dayTypeLabel(form.dayType)} days do not calculate worked hours. Any time values already entered are kept in the form.</p>}
          </Card>

          <Card>
            <CardHeader title={m.tasks} description="Capture the work completed for this date. These fields are stored with the daily entry." />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="daily-activity" label={m.activity} value={form.activity} onChange={(event) => setField("activity", event.target.value)} maxLength={160} error={errors.activity} hint={`${form.activity.length}/160 characters`} />
              <TextField id="daily-accomplishmentType" label={m.type} value={form.accomplishmentType} onChange={(event) => setField("accomplishmentType", event.target.value)} list="accomplishment-types" maxLength={80} error={errors.accomplishmentType} placeholder="Feature, bug fix, documentation..." />
              <TextField id="daily-accomplishmentStatus" label={m.status} value={form.accomplishmentStatus} onChange={(event) => setField("accomplishmentStatus", event.target.value)} list="accomplishment-statuses" maxLength={80} error={errors.accomplishmentStatus} placeholder="Completed, in progress..." />
              <TextField id="daily-hoursSpentMinutes" label={`${m.hoursSpent} (hours)`} type="number" min={0} max={24} step={0.25} value={form.hoursSpentMinutes / 60} onChange={(event) => setField("hoursSpentMinutes", Math.round(Number(event.target.value) * 60))} error={errors.hoursSpentMinutes} />
            </div>
            <datalist id="accomplishment-types">
              <option value="Feature" /><option value="Bug fix" /><option value="Documentation" /><option value="Maintenance" /><option value="Review" />
            </datalist>
            <datalist id="accomplishment-statuses">
              <option value="Completed" /><option value="In progress" /><option value="Blocked" /><option value="Planned" />
            </datalist>
            <TextareaField
              id="daily-tasksText"
              className="mt-4"
              label="Task lines"
              rows={9}
              value={form.tasksText}
              onChange={(event) => setField("tasksText", event.target.value)}
              hint={`One task per line. Blank lines are ignored. ${tasks.length}/100 tasks.`}
              error={errors.tasksText}
              placeholder={"Added user authentication endpoint\nReviewed calculation preview behavior\nWrote regression notes for overnight shifts"}
            />
            <TextareaField id="daily-remarks" className="mt-4" label={m.remarks} rows={4} value={form.remarks} onChange={(event) => setField("remarks", event.target.value)} maxLength={10000} error={errors.remarks} hint="Optional context for the validator or supervisor." />
          </Card>
        </div>

        <aside className="space-y-5 self-start xl:sticky xl:top-24">
          <Card>
            <CardHeader
              title="Calculated hours"
              description="The server remains authoritative after saving."
              action={<Badge tone={previewLabel === "Saved" ? "success" : previewLabel === "Unavailable" ? "warning" : previewLabel === "Calculating" ? "info" : "neutral"}>{previewLabel}</Badge>}
            />
            <dl className="divide-y divide-line">
              {summaryRows(displayHours).map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-[13px] text-muted">{row.label}</dt>
                  <dd className={cn("text-[13px] font-semibold tabular", row.value === undefined ? "text-muted" : "text-ink")}>{row.value === undefined ? "—" : `${hours(row.value)} h`}</dd>
                </div>
              ))}
            </dl>

            {showingConfirmed && <p className="mt-3 text-[11px] leading-relaxed text-muted">These are the authoritative values from the last successful save.</p>}
            {!showingConfirmed && preview.state === "calculating" && <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted" aria-live="polite"><LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Calculating hours...</p>}
            {!showingConfirmed && preview.state === "error" && <InlineAlert tone="warning" className="mt-3">{m.hoursPreviewError}</InlineAlert>}
            {!showingConfirmed && preview.state === "idle" && <p className="mt-3 text-[11px] leading-relaxed text-muted">{form.dayType === "LEAVE" || form.dayType === "ABSENT" ? "Leave and absent days calculate zero hours." : "Enter both a time in and a time out to request a preview."}</p>}
            {usingShiftFallback && <p className="mt-3 text-[11px] leading-relaxed text-brand">Calculated from your shift schedule because both time fields are empty.</p>}
            {workdayShortfall && <InlineAlert tone="warning" className="mt-3">A timed workday must total at least 8 regular hours before the server will accept it. Adjust the times or break.</InlineAlert>}

            {form.calculationMode === "OVERRIDE" && (
              <div className="mt-4 border-t border-line pt-4">
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-[11px] leading-relaxed text-warning">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>Manual values are sent exactly as entered. The server still validates the saved record.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {overrideFields.map((field) => (
                    <TextField
                      key={field.key}
                      id={`daily-override-${field.key}`}
                      label={`${field.label} (h)`}
                      type="number"
                      min={0}
                      max={24}
                      step={0.25}
                      value={form.override[field.key] / 60}
                      onChange={(event) => setOverride(field.key, Math.round(Number(event.target.value) * 60))}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Actions" description={saved ? "This date has a stored record." : "This date has no stored record yet."} />
            <div className="grid gap-2.5">
              <Button className="w-full" size="lg" loading={saving} disabled={saved && !dirty && !usingShiftFallback} onClick={() => void handleSave()} icon={<Save className="size-4" aria-hidden="true" />}>{saving ? "Saving entry..." : m.saveEntry}</Button>
              <Button className="w-full" variant="secondary" disabled={!dirty || saving} onClick={reset} icon={<RotateCcw className="size-4" aria-hidden="true" />}>{saved ? "Discard changes" : "Clear draft"}</Button>
              {saved && <Button className="w-full" variant="danger-soft" loading={clearing} disabled={saving} onClick={() => setDeleteOpen(true)} icon={<Trash2 className="size-4" aria-hidden="true" />}>{clearing ? "Deleting entry..." : "Delete entry"}</Button>}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
              <CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {dirty ? "Unsaved edits stay on this date until you save, discard, or leave." : usingShiftFallback ? "No times are stored. Save to apply the shift hours." : saved ? "Saved values match the current form." : "Nothing has been saved for this date."}
            </p>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this daily entry?"
        description={`The saved record for ${formatLongDate(selectedDate)} will be permanently removed, including its attendance, tasks, and remarks.`}
        confirmLabel={clearing ? "Deleting..." : "Delete entry"}
        cancelLabel="Keep entry"
        tone="danger"
        busy={clearing}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};
