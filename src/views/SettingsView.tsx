import { useEffect, useState } from "react";
import { Clock3, Globe2, Info, MoonStar, Save, UserRound } from "lucide-react";
import type { Profile } from "../api";
import { minuteToTime, timeToMinute } from "../api";
import { Badge, Button, Card, CardHeader, InlineAlert, PageHeader, TextField, cn } from "../components/ui";
import { usePageDirty } from "../components/unsaved";
import { messages as m } from "../constants/messages";
import { firstErrorKey, validateProfile, type FieldErrors } from "../domain/validation";

type SettingsViewProps = {
  profile: Profile;
  onSave: (profile: Profile) => Promise<Profile | null>;
  saving: boolean;
};

const settingsFieldId = (key: string) => `settings-${key}`;

export const SettingsView = ({ profile, onSave, saving }: SettingsViewProps) => {
  const [draft, setDraft] = useState<Profile>(profile);
  const [baseline, setBaseline] = useState<Profile>(profile);
  const [errors, setErrors] = useState<FieldErrors>({});
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  usePageDirty(dirty);

  useEffect(() => {
    if (!dirty) {
      setDraft(profile);
      setBaseline(profile);
    }
  }, [profile, dirty]);

  const set = <K extends keyof Profile,>(key: K, value: Profile[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const invalidCount = Object.keys(errors).length;

  const handleSave = async () => {
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = firstErrorKey(nextErrors);
      if (first) window.requestAnimationFrame(() => document.getElementById(settingsFieldId(first))?.focus());
      return;
    }
    const saved = await onSave({ ...draft, employeeName: draft.employeeName.trim() });
    if (saved) {
      setDraft(saved);
      setBaseline(saved);
      setErrors({});
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={m.settings}
        title="Employee profile and attendance settings"
        description="These values feed the employee details, shift rules, night-differential window, and exported workbooks."
      />

      <InlineAlert tone="info" title="This profile is shared by the workspace">
        The backend currently stores one primary profile for the deployment. Changes here affect exports and calculations for every authenticated session, not only your own account.
      </InlineAlert>

      {invalidCount > 0 && (
        <InlineAlert tone="danger" title="Check the highlighted fields">
          {invalidCount === 1 ? "One settings value needs attention before saving." : `${invalidCount} settings values need attention before saving.`}
        </InlineAlert>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Employee information" description="Shown in the sidebar and used in the company workbooks." action={<span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand" aria-hidden="true"><UserRound className="size-4" /></span>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="settings-employeeName" label={m.employeeName} value={draft.employeeName} onChange={(event) => set("employeeName", event.target.value)} maxLength={160} error={errors.employeeName} required />
            <TextField id="settings-employeeId" label={m.employeeId} value={draft.employeeId} onChange={(event) => set("employeeId", event.target.value)} maxLength={80} error={errors.employeeId} />
            <TextField id="settings-position" label={m.position} value={draft.position} onChange={(event) => set("position", event.target.value)} maxLength={160} error={errors.position} />
            <TextField id="settings-projectAssignment" label={m.projectAssignment} value={draft.projectAssignment} onChange={(event) => set("projectAssignment", event.target.value)} maxLength={160} error={errors.projectAssignment} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Validation and signoff" description="Names used on the profile and exported forms." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="settings-validatorName" label={m.validatorName} value={draft.validatorName} onChange={(event) => set("validatorName", event.target.value)} maxLength={160} error={errors.validatorName} />
            <TextField id="settings-supervisorName" label={m.supervisorName} value={draft.supervisorName} onChange={(event) => set("supervisorName", event.target.value)} maxLength={160} error={errors.supervisorName} />
          </div>
          <div className="mt-4 rounded-lg border border-line bg-canvas/70 p-3">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-ink"><Globe2 className="size-4 text-brand" aria-hidden="true" /> Reporting timezone</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">The backend currently uses <strong className="font-semibold text-ink">{draft.timezone}</strong> for the default cutoff and “today” calculations. It is preserved as stored.</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Attendance settings" description="Shift and break defaults used by the attendance form." action={<span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand" aria-hidden="true"><Clock3 className="size-4" /></span>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="settings-shiftStartMinute" label={m.shiftStart} type="time" value={minuteToTime(draft.shiftStartMinute)} onChange={(event) => set("shiftStartMinute", timeToMinute(event.target.value) ?? 0)} error={errors.shiftStartMinute} hint="Used as the default time in for new workdays." />
            <TextField id="settings-shiftEndMinute" label={m.shiftEnd} type="time" value={minuteToTime(draft.shiftEndMinute)} onChange={(event) => set("shiftEndMinute", timeToMinute(event.target.value) ?? 0)} error={errors.shiftEndMinute} hint="Used as the default time out for new workdays." />
            <TextField id="settings-standardBreakMinutes" label={`${m.standardBreak} (minutes)`} type="number" min={0} max={720} step={1} value={draft.standardBreakMinutes} onChange={(event) => set("standardBreakMinutes", Number(event.target.value))} error={errors.standardBreakMinutes} hint="Applied to new workday drafts." />
            <TextField id="settings-regularLimitMinutes" label={`${m.regularLimit} (hours)`} type="number" min={0} max={24} step={0.25} value={draft.regularLimitMinutes / 60} onChange={(event) => set("regularLimitMinutes", Math.round(Number(event.target.value) * 60))} error={errors.regularLimitMinutes} hint="Persisted for reference. Current automatic calculations use the fixed 8-hour regular threshold." />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2.5 text-[12px] leading-relaxed text-warning">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>Changing the regular-hour limit does not change current payroll calculations. That calculation rule belongs to a separate backend change.</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Night differential" description="The night window used by the server’s automatic calculation." action={<span className="grid size-9 place-items-center rounded-lg bg-warning-soft text-warning" aria-hidden="true"><MoonStar className="size-4" /></span>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="settings-nightStartMinute" label={m.nightStart} type="time" value={minuteToTime(draft.nightStartMinute)} onChange={(event) => set("nightStartMinute", timeToMinute(event.target.value) ?? 0)} error={errors.nightStartMinute} />
            <TextField id="settings-nightEndMinute" label={m.nightEnd} type="time" value={minuteToTime(draft.nightEndMinute)} onChange={(event) => set("nightEndMinute", timeToMinute(event.target.value) ?? 0)} error={errors.nightEndMinute} />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted">A window that crosses midnight is supported (for example, 10:00 PM to 6:00 AM). The saved profile is used by both the preview and the final save calculation.</p>
        </Card>
      </div>

      <div className={cn("sticky bottom-[4.5rem] z-20 flex flex-col gap-3 rounded-xl border border-line bg-surface/95 p-3.5 backdrop-blur popover-shadow sm:flex-row sm:items-center sm:justify-between lg:bottom-4", dirty && "border-brand/25")}>
        <div className="flex items-center gap-2.5">
          <Badge tone={dirty ? "warning" : "success"}>{dirty ? "Unsaved changes" : "Saved"}</Badge>
          <p className="text-[12px] text-muted">{dirty ? "Save or discard your edits before leaving this screen." : "Settings match the last saved profile."}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" disabled={!dirty || saving} onClick={() => { setDraft(baseline); setErrors({}); }}>Discard changes</Button>
          <Button loading={saving} onClick={() => void handleSave()} icon={<Save className="size-4" aria-hidden="true" />}>{saving ? "Saving settings..." : m.save}</Button>
        </div>
      </div>
    </div>
  );
};
