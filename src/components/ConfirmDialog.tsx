import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "primary", busy = false, onConfirm, onCancel }: ConfirmDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(next) => { if (!next && !busy) onCancel(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-enter" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_70px_rgb(16_36_61/22%)] data-[state=open]:animate-enter">
        <div className="flex items-start gap-3.5">
          <span className={tone === "danger" ? "grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger" : "grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"} aria-hidden="true">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <Dialog.Title className="text-base font-semibold tracking-[-.01em] text-ink">{title}</Dialog.Title>
            <Dialog.Description className="mt-1.5 text-[13px] leading-relaxed text-muted">{description}</Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button type="button" className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Close dialog" disabled={busy}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </Dialog.Close>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy} icon={busy ? <LoaderCircle className="size-4 animate-spin" /> : undefined}>{confirmLabel}</Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
