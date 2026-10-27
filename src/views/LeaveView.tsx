import { useEffect, useRef, useState } from "react";
import { CalendarDays, Info, Save, Trash2 } from "lucide-react";
import type { LeaveRequest, Period } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Badge, Button, Card, CardHeader, InlineAlert, PageHeader, SelectField, TextField, TextareaField, cn } from "../components/ui";
import { usePageDirty } from "../components/unsaved";
import { messages as m } from "../constants/messages";
import { daysBetween, displayToIso, formatRangeLabel, isoToDisplay, periodKindLabel } from "../domain/date";
import { leaveTypeLabel } from "../domain/format";
import { firstErrorKey, validateLeave, type FieldErrors, type LeaveDraft } from "../domain/validation";

type LeaveViewProps = {
  leave: LeaveRequest | null;
  period: Period;
  today: string;
  onSave: (leave: LeaveRequest) => Promise<LeaveRequest | null>;
  onClear: () => Promise<boolean>;
  saving: boolean;
  clearing: boolean;
};

const emptyLeave = (today: string): LeaveDraft => ({
  dateFiled: displayToIso(today),
  leaveType: "VACATION",
  fromDate: "",
  toDate: "",
  numberOfDays: 1,
  reason: ""
});

const fromLeave = (leave: LeaveRequest): LeaveDraft => ({
  dateFiled: displayToIso(leave.dateFiled),
  leaveType: leave.leaveType,
  fromDate: displayToIso(leave.fromDate),
  toDate: displayToIso(leave.toDate),
  numberOfDays: leave.numberOfDays,
  reason: leave.reason
});

const toLeave = (draft: LeaveDraft): LeaveRequest => ({
  dateFiled: isoToDisplay(draft.dateFiled),
  leaveType: draft.leaveType,
  fromDate: isoToDisplay(draft.fromDate),
  toDate: isoToDisplay(draft.toDate),
  numberOfDays: draft.numberOfDays,
  reason: draft.reason.trim()
});

const leaveFieldId = (key: string) => `leave-${key}`;

export const LeaveView = ({ leave, period, today, onSave, onClear, saving, clearing }: LeaveViewProps) => {
  const [draft, setDraft] = useState<LeaveDraft>(() => leave ? fromLeave(leave) : emptyLeave(today));
  const [baseline, setBaseline] = useState<LeaveDraft>(() => leave ? fromLeave(leave) : emptyLeave(today));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const periodRef = useRef(period.id);

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  usePageDirty(dirty);

  useEffect(() => {
    const next = leave ? fromLeave(leave) : emptyLeave(today);
    if (periodRef.current !== period.id) {
      periodRef.current = period.id;
      setDraft(next);
      setBaseline(next);
      setErrors({});
      return;
    }
    if (!dirty) {
      setDraft(next);
      setBaseline(next);
    }
  }, [period.id, leave, today, dirty]);

  const set = <K extends keyof LeaveDraft,>(key: K, value: LeaveDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const from = isoToDisplay(draft.fromDate);
  const to = isoToDisplay(draft.toDate);
  const calendarDays = from && to ? daysBetween(from, to) : 0;
  const invalidCount = Object.keys(errors).length;

  const handleSave = async () => {
    const nextErrors = validateLeave(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = firstErrorKey(nextErrors);
      if (first) window.requestAnimationFrame(() => document.getElementById(leaveFieldId(first))?.focus());
      return;
    }
    const saved = await onSave(toLeave(draft));
    if (saved) {
      const next = fromLeave(saved);
      setDraft(next);
      setBaseline(next);
      setErrors({});
    }
  };

  const handleDelete = async () => {
    const cleared = await onClear();
    if (cleared) {
      const next = emptyLeave(today);
      setDraft(next);
      setBaseline(next);
      setErrors({});
    }
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={m.leave}
        title="Leave request"
        description={`${formatRangeLabel(period.startDate, period.endDate)} · ${periodKindLabel(period.startDate, period.endDate)}. Only one leave request can be attached to a reporting period.`}
      />

      {invalidCount > 0 && (
        <InlineAlert tone="danger" title="Check the highlighted fields">
          {invalidCount === 1 ? "One field needs attention before this request can be saved." : `${invalidCount} fields need attention before this request can be saved.`}
        </InlineAlert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader
            title="Request details"
            description="Dates and the day count are saved as entered. The server validates the request."
            action={<Badge tone={dirty ? "warning" : leave ? "success" : "neutral"}>{dirty ? "Unsaved changes" : leave ? "Saved request" : "New request"}</Badge>}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="leave-dateFiled"
              label={m.leaveDateFiled}
              type="date"
              value={draft.dateFiled}
              onChange={(event) => set("dateFiled", event.target.value)}
              error={errors.dateFiled}
              required
            />
            <SelectField
              id="leave-leaveType"
              label={m.leaveType}
              value={draft.leaveType}
              onChange={(event) => set("leaveType", event.target.value as LeaveDraft["leaveType"])}
              error={errors.leaveType}
              required
            >
              <option value="VACATION">{m.vacation}</option>
              <option value="SICK">{m.sick}</option>
              <option value="OTHER">{m.other}</option>
            </SelectField>
            <TextField
              id="leave-fromDate"
              label={m.fromDate}
              type="date"
              value={draft.fromDate}
              onChange={(event) => set("fromDate", event.target.value)}
              error={errors.fromDate}
              required
            />
            <TextField
              id="leave-toDate"
              label={m.toDate}
              type="date"
              value={draft.toDate}
              onChange={(event) => set("toDate", event.target.value)}
              error={errors.toDate}
              required
            />
            <TextField
              id="leave-numberOfDays"
              label={m.numberOfDays}
              type="number"
              min={0.5}
              max={31}
              step={0.5}
              value={draft.numberOfDays}
              onChange={(event) => set("numberOfDays", Number(event.target.value))}
              error={errors.numberOfDays}
              hint="Enter the policy-approved leave day count. It is not calculated automatically."
              required
            />
            <div className="flex items-end pb-2 text-[12px] leading-relaxed text-muted">
              {calendarDays > 0 ? `Calendar span: ${calendarDays} ${calendarDays === 1 ? "day" : "days"}. This is not necessarily the chargeable leave count.` : "Select both dates to see the calendar span."}
            </div>
          </div>

          <TextareaField
            id="leave-reason"
            className="mt-4"
            label={m.reason}
            rows={6}
            value={draft.reason}
            onChange={(event) => set("reason", event.target.value)}
            error={errors.reason}
            hint={`${draft.reason.length}/10,000 characters`}
            required
          />

          <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center">
            <Button loading={saving} onClick={() => void handleSave()} icon={<Save className="size-4" aria-hidden="true" />}>{saving ? "Saving request..." : "Save leave request"}</Button>
            <Button variant="secondary" disabled={!dirty || saving} onClick={() => { setDraft(baseline); setErrors({}); }}>Discard changes</Button>
            {leave && <Button variant="danger-soft" className="sm:ml-auto" loading={clearing} disabled={saving} onClick={() => setDeleteOpen(true)} icon={<Trash2 className="size-4" aria-hidden="true" />}>Delete request</Button>}
          </div>
        </Card>

        <aside className="space-y-5 self-start">
          <Card>
            <CardHeader title="Period context" description="This request belongs to the active reporting period." />
            <div className="rounded-xl border border-line bg-canvas/70 p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand" aria-hidden="true"><CalendarDays className="size-4" /></span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{formatRangeLabel(period.startDate, period.endDate)}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{periodKindLabel(period.startDate, period.endDate)}</p>
                </div>
              </div>
            </div>
            <dl className="mt-4 divide-y divide-line text-[12px]">
              <div className="flex items-center justify-between py-2.5"><dt className="text-muted">Saved request</dt><dd className="font-semibold text-ink">{leave ? "Yes" : "No"}</dd></div>
              {leave && <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-muted">Type</dt><dd className="text-right font-semibold text-ink">{leaveTypeLabel(leave.leaveType)}</dd></div>}
              {leave && <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-muted">Saved dates</dt><dd className="text-right font-semibold text-ink">{formatRangeLabel(leave.fromDate, leave.toDate)}</dd></div>}
              {leave && <div className="flex items-center justify-between py-2.5"><dt className="text-muted">Saved days</dt><dd className="font-semibold text-ink tabular">{leave.numberOfDays}</dd></div>}
            </dl>
          </Card>

          <Card className="border-brand/15 bg-brand-soft/50">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-brand" aria-hidden="true"><Info className="size-4" /></span>
              <div>
                <h2 className="text-[13px] font-semibold text-ink">One request per period</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">Saving replaces the existing request for this period. Change the reporting period above to manage a different period.</p>
              </div>
            </div>
          </Card>

          {leave && (
            <Card>
              <CardHeader title="Saved reason" />
              <p className={cn("whitespace-pre-wrap text-[12px] leading-relaxed text-muted", leave.reason.length > 400 && "max-h-40 overflow-y-auto")}>{leave.reason}</p>
            </Card>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this leave request?"
        description={`The saved ${leave ? leaveTypeLabel(leave.leaveType).toLowerCase() : "leave"} request for ${formatRangeLabel(period.startDate, period.endDate)} will be removed. This cannot be undone.`}
        confirmLabel={clearing ? "Deleting..." : "Delete request"}
        cancelLabel="Keep request"
        tone="danger"
        busy={clearing}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};
