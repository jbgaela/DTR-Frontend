import { useEffect, useMemo, useState } from "react";
import type { DailyHours, DailyHoursPreviewInput, DailyRecord, DailyRecordInput, DayType } from "../api";
import { hours, minuteToTime, timeToMinute } from "../api";
import { messages as m } from "../constants/messages";
import { Button, Card, Field } from "../components/ui";
import { useDailyHoursPreview } from "../hooks/useDailyHoursPreview";

type RecordValue = Omit<DailyRecord, "id"> | DailyRecord;
type FormState = RecordValue & { tasksText: string };

const toForm = (record: RecordValue): FormState => ({ ...record, tasksText: record.tasks.map((task) => task.text).join("\n") });
const toOverride = (record: RecordValue): Record<string, number> => ({ regularMinutes: record.regularMinutes, nightDiffMinutes: record.nightDiffMinutes, regularOtMinutes: record.regularOtMinutes, nightDiffOtMinutes: record.nightDiffOtMinutes, restDayMinutes: record.restDayMinutes, restDayOtMinutes: record.restDayOtMinutes, holidayMinutes: record.holidayMinutes });
const recordIdentity = (record: RecordValue) => "id" in record ? record.id : "new";
const toHours = (record: RecordValue): DailyHours => ({ regularMinutes: record.regularMinutes, nightDiffMinutes: record.nightDiffMinutes, regularOtMinutes: record.regularOtMinutes, nightDiffOtMinutes: record.nightDiffOtMinutes, restDayMinutes: record.restDayMinutes, restDayOtMinutes: record.restDayOtMinutes, holidayMinutes: record.holidayMinutes });
const toPreviewInput = (record: RecordValue): DailyHoursPreviewInput => ({ dayType: record.dayType, clockInMinute: record.clockInMinute, clockOutMinute: record.clockOutMinute, endsNextDay: record.endsNextDay, breakMinutes: record.breakMinutes, calculationMode: record.calculationMode, override: record.calculationMode === "OVERRIDE" ? toOverride(record) : undefined });

type DailyEntryViewProps = {
  record: RecordValue;
  dates: string[];
  selectedDate: string;
  onDate: (date: string) => void;
  onSave: (record: DailyRecordInput) => Promise<DailyRecord | null>;
  onClear: () => Promise<boolean>;
  saving: boolean;
  clearing: boolean;
};

export const DailyEntryView = ({ record, dates, selectedDate, onDate, onSave, onClear, saving, clearing }: DailyEntryViewProps) => {
  const [form, setForm] = useState<FormState>(() => toForm(record));
  const [override, setOverride] = useState<Record<string, number>>(() => toOverride(record));
  const [confirmed, setConfirmed] = useState(() => { const input = toPreviewInput(record); return { signature: JSON.stringify(input), hours: toHours(record) }; });
  const identity = recordIdentity(record);

  useEffect(() => {
    setForm(toForm(record));
    setOverride(toOverride(record));
    const input = toPreviewInput(record);
    setConfirmed({ signature: JSON.stringify(input), hours: toHours(record) });
  }, [record.workDate, identity]);

  const set = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  const previewInput = useMemo<DailyHoursPreviewInput>(() => ({
    dayType: form.dayType,
    clockInMinute: form.clockInMinute,
    clockOutMinute: form.clockOutMinute,
    endsNextDay: form.endsNextDay,
    breakMinutes: form.breakMinutes,
    calculationMode: form.calculationMode,
    override: form.calculationMode === "OVERRIDE" ? override : undefined
  }), [form.dayType, form.clockInMinute, form.clockOutMinute, form.endsNextDay, form.breakMinutes, form.calculationMode, override]);
  const preview = useDailyHoursPreview(previewInput);
  const inputSignature = JSON.stringify(previewInput);
  const showingConfirmed = inputSignature === confirmed.signature;
  const displayHours = showingConfirmed ? (preview.hours || confirmed.hours) : preview.hours;
  const summary = [{ label: m.regularHours, value: displayHours?.regularMinutes }, { label: m.nightOtHours, value: displayHours?.nightDiffOtMinutes }, { label: m.overtimeHours, value: displayHours?.regularOtMinutes }, { label: m.restDayHours, value: displayHours ? displayHours.restDayMinutes + displayHours.restDayOtMinutes : undefined }];
  const overrideFields = [{ key: "regularMinutes", label: m.regularHours }, { key: "nightDiffMinutes", label: m.nightOtHours }, { key: "regularOtMinutes", label: m.overtimeHours }, { key: "nightDiffOtMinutes", label: m.nightOtHours }, { key: "restDayMinutes", label: m.restDayHours }, { key: "restDayOtMinutes", label: m.overtimeHours }, { key: "holidayMinutes", label: m.holiday }];

  const payload = (): DailyRecordInput => ({ dayType: form.dayType, clockInMinute: form.clockInMinute, clockOutMinute: form.clockOutMinute, endsNextDay: form.endsNextDay, breakMinutes: form.breakMinutes, calculationMode: form.calculationMode, override: form.calculationMode === "OVERRIDE" ? override : undefined, activity: form.activity, accomplishmentType: form.accomplishmentType, accomplishmentStatus: form.accomplishmentStatus, hoursSpentMinutes: form.hoursSpentMinutes, remarks: form.remarks, tasks: form.tasksText.split("\n").map((task) => task.trim()).filter(Boolean) });
  const handleSave = async () => {
    const saved = await onSave(payload());
    if (saved) {
      setForm(toForm(saved));
      setOverride(toOverride(saved));
      const input = toPreviewInput(saved);
      setConfirmed({ signature: JSON.stringify(input), hours: toHours(saved) });
    }
  };
  const handleClear = async () => {
    const cleared = await onClear();
    if (cleared && identity === "new") {
      setForm(toForm(record));
      setOverride(toOverride(record));
    }
  };

  return <div className="grid gap-5">
    <div className="flex items-end justify-between gap-4"><div><p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.dailyEntry}</p><h2 className="mt-1 text-[23px] font-bold tracking-[-.03em] text-ink">{selectedDate}</h2></div><select className="w-full max-w-[220px] rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" value={selectedDate} onChange={(event) => onDate(event.target.value)}>{dates.map((date) => <option key={date}>{date}</option>)}</select></div>
    <Card title={m.attendance}><div className="grid grid-cols-2 gap-[15px] max-[800px]:grid-cols-1">
      <Field label={m.dayType}><select value={form.dayType} onChange={(event) => { const dayType = event.target.value as DayType; set("dayType", dayType); set("breakMinutes", dayType === "WORKDAY" ? 60 : 0); }}>{["WORKDAY", "REST_DAY", "HOLIDAY", "LEAVE", "ABSENT"].map((type) => <option key={type} value={type}>{type === "WORKDAY" ? m.workday : type === "REST_DAY" ? m.restDay : type === "HOLIDAY" ? m.holiday : type === "LEAVE" ? m.leaveDay : m.absent}</option>)}</select></Field>
      <Field label={m.timeIn}><input type="time" value={minuteToTime(form.clockInMinute)} onChange={(event) => set("clockInMinute", timeToMinute(event.target.value))} /></Field>
      <Field label={m.timeOut}><input type="time" value={minuteToTime(form.clockOutMinute)} onChange={(event) => set("clockOutMinute", timeToMinute(event.target.value))} /></Field>
      <Field label={m.breakMinutes}><input type="number" min="0" max="720" value={form.breakMinutes} onChange={(event) => set("breakMinutes", Number(event.target.value))} /></Field>
      <Field label={m.calculation}><select value={form.calculationMode} onChange={(event) => set("calculationMode", event.target.value)}><option value="AUTO">{m.automatic}</option><option value="OVERRIDE">{m.override}</option></select></Field>
    </div><label className="mt-[17px] flex items-center gap-2 text-[13px] text-slate-600"><input className="accent-brand" type="checkbox" checked={form.endsNextDay} onChange={(event) => set("endsNextDay", event.target.checked)} />{m.overnight}</label>{form.calculationMode === "OVERRIDE" && <div className="mt-4 grid grid-cols-2 gap-[15px] max-[800px]:grid-cols-1">{overrideFields.map((item) => <Field key={item.key} label={item.label}><input type="number" min="0" step="0.25" value={(override[item.key] || 0) / 60} onChange={(event) => setOverride((current) => ({ ...current, [item.key]: Math.round(Number(event.target.value) * 60) }))} /></Field>)}</div>}</Card>
    <Card title={m.tasks}><div className="grid grid-cols-2 gap-[15px] max-[800px]:grid-cols-1"><Field label={m.activity}><input value={form.activity} onChange={(event) => set("activity", event.target.value)} /></Field><Field label={m.type}><input value={form.accomplishmentType} onChange={(event) => set("accomplishmentType", event.target.value)} /></Field><Field label={m.status}><input value={form.accomplishmentStatus} onChange={(event) => set("accomplishmentStatus", event.target.value)} /></Field><Field label={m.hoursSpent}><input type="number" min="0" step="0.25" value={form.hoursSpentMinutes / 60} onChange={(event) => set("hoursSpentMinutes", Math.round(Number(event.target.value) * 60))} /></Field></div><Field label={m.taskHint}><textarea rows={8} value={form.tasksText} onChange={(event) => set("tasksText", event.target.value)} /></Field><Field label={m.remarks}><textarea rows={3} value={form.remarks} onChange={(event) => set("remarks", event.target.value)} /></Field></Card>
    <Card title={m.review}><div className="grid grid-cols-4 gap-[11px] max-[800px]:grid-cols-2">{summary.map((item) => <div className="rounded-lg bg-slate-50 p-[13px]" key={item.label}><span className="block text-[11px] text-slate-500">{item.label}</span><strong className="mt-1 block text-[19px] text-ink">{item.value === undefined ? "—" : hours(item.value)}</strong></div>)}</div>{preview.calculating && !showingConfirmed && <p className="mb-0 mt-3 text-xs text-slate-500" aria-live="polite">{m.calculatingHours}</p>}{preview.error && <p className="mb-0 mt-3 rounded-lg bg-amber-50 px-3.5 py-[11px] text-[13px] text-amber-700" role="alert">{m.hoursPreviewError}</p>}<div className="mt-[18px] flex gap-2"><Button disabled={saving} onClick={() => void handleSave()}>{m.save}</Button><Button disabled={clearing} secondary onClick={() => void handleClear()}>{m.delete}</Button></div></Card>
  </div>;
};
