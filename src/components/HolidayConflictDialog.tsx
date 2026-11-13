import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import type { Holiday } from "../api";
import { Button } from "./ui";

type HolidayConflictDialogProps = {
  open: boolean;
  holidays: Holiday[];
  busy?: boolean;
  onCancel: () => void;
  onChangeToHoliday: () => void;
  onSaveAsWorkday: () => void;
};

export const HolidayConflictDialog = ({ open, holidays, busy = false, onCancel, onChangeToHoliday, onSaveAsWorkday }: HolidayConflictDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(next) => { if (!next && !busy) onCancel(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-enter" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_70px_rgb(16_36_61/22%)] data-[state=open]:animate-enter">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning" aria-hidden="true">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <Dialog.Title className="text-base font-semibold tracking-[-.01em] text-ink">This date is a Philippine holiday</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Review the holiday before saving this entry as a workday. If you worked, you can continue and confirm that choice.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button type="button" className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Close dialog" disabled={busy}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </Dialog.Close>
        </div>
        <ul className="mt-5 space-y-2 rounded-xl border border-warning/20 bg-warning-soft/50 p-3 text-sm text-ink">
          {holidays.map((holiday) => (
            <li key={`${holiday.date}-${holiday.name}`} className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{holiday.name}</span>
              <span className="text-xs text-muted">{holiday.classification === "REGULAR" ? "Regular holiday" : "Special non-working day"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="secondary" onClick={onChangeToHoliday} disabled={busy}>Change to Holiday</Button>
          <Button onClick={onSaveAsWorkday} loading={busy} disabled={busy}>Save as Workday</Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
