import { useState } from "react";
import type { LeaveRequest } from "../api";
import { todayInput } from "../domain/date";
import { messages as m } from "../constants/messages";
import { Button, Card, Field } from "../components/ui";

const newLeave = (): LeaveRequest => ({ dateFiled: todayInput(), leaveType: "VACATION", fromDate: "", toDate: "", numberOfDays: 1, reason: "" });

export const LeaveView = ({ leave, onSave, onClear, saving, clearing }: { leave: LeaveRequest | null; onSave: (leave: LeaveRequest) => Promise<LeaveRequest | null>; onClear: () => Promise<boolean>; saving: boolean; clearing: boolean }) => {
  const [draft, setDraft] = useState(() => leave || newLeave());
  const save = async () => { const saved = await onSave(draft); if (saved) setDraft(saved); };
  const clear = async () => { if (await onClear()) setDraft(newLeave()); };
  return <div className="grid gap-5"><div className="flex items-end justify-between gap-4"><div><p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.leave}</p><h2 className="mt-1 text-[23px] font-bold tracking-[-.03em] text-ink">{m.leave}</h2></div></div><Card title={m.leave}><div className="grid grid-cols-2 gap-[15px] max-[800px]:grid-cols-1"><Field label={m.leaveDateFiled}><input value={draft.dateFiled} placeholder={m.dateFormat} onChange={(event) => setDraft({ ...draft, dateFiled: event.target.value })} /></Field><Field label={m.leaveType}><select value={draft.leaveType} onChange={(event) => setDraft({ ...draft, leaveType: event.target.value as LeaveRequest["leaveType"] })}><option value="VACATION">{m.vacation}</option><option value="SICK">{m.sick}</option><option value="OTHER">{m.other}</option></select></Field><Field label={m.fromDate}><input value={draft.fromDate} placeholder={m.dateFormat} onChange={(event) => setDraft({ ...draft, fromDate: event.target.value })} /></Field><Field label={m.toDate}><input value={draft.toDate} placeholder={m.dateFormat} onChange={(event) => setDraft({ ...draft, toDate: event.target.value })} /></Field><Field label={m.numberOfDays}><input type="number" min="0.5" step="0.5" value={draft.numberOfDays} onChange={(event) => setDraft({ ...draft, numberOfDays: Number(event.target.value) })} /></Field></div><Field label={m.reason}><textarea rows={6} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} /></Field><div className="mt-[18px] flex gap-2"><Button disabled={saving} onClick={() => void save()}>{m.save}</Button><Button disabled={clearing} secondary onClick={() => void clear()}>{m.delete}</Button></div></Card></div>;
};
