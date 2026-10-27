import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./ui";
import { messages as m } from "../constants/messages";

export const ErrorState = ({ title = m.loadErrorTitle, message, retrying = false, onRetry }: { title?: string; message: string; retrying?: boolean; onRetry: () => void }) => (
  <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_50%_0%,#eaf1ff_0,transparent_46%),#f5f7fb] p-6">
    <section className="w-full max-w-[470px] rounded-2xl border border-line bg-surface p-8 text-center surface-shadow">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-danger-soft text-danger" aria-hidden="true"><AlertTriangle className="size-6" /></span>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.14em] text-brand">{m.appName}</p>
      <h1 className="mt-1.5 text-xl font-semibold tracking-[-.03em] text-ink">{title}</h1>
      <p className="mt-2 rounded-lg border border-danger/15 bg-danger-soft px-3.5 py-2.5 text-left text-[13px] leading-relaxed text-danger" role="alert">{message}</p>
      <Button className="mt-5" onClick={onRetry} loading={retrying} icon={<RefreshCcw className="size-4" aria-hidden="true" />}>{m.retry}</Button>
    </section>
  </main>
);
