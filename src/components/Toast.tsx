import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "./ui";

export type NoticeKind = "success" | "error" | "info";
export type Notice = { id: number; kind: NoticeKind; message: string };

const tones = {
  success: { wrapper: "border-success/20 bg-surface text-ink", icon: <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> },
  error: { wrapper: "border-danger/20 bg-surface text-ink", icon: <AlertCircle className="size-5 text-danger" aria-hidden="true" /> },
  info: { wrapper: "border-brand/20 bg-surface text-ink", icon: <Info className="size-5 text-brand" aria-hidden="true" /> }
};

export const Toast = ({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) => {
  if (!notice) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end lg:bottom-6" aria-live={notice.kind === "error" ? "assertive" : "polite"}>
      <div className={cn("flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3.5 popover-shadow animate-enter", tones[notice.kind].wrapper)} role={notice.kind === "error" ? "alert" : "status"}>
        <span className="mt-0.5 shrink-0">{tones[notice.kind].icon}</span>
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed">{notice.message}</p>
        <button type="button" onClick={onDismiss} className="grid size-6 shrink-0 place-items-center rounded-md text-muted hover:bg-canvas hover:text-ink" aria-label="Dismiss notification">
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
