import { LoaderCircle } from "lucide-react";
import { messages as m } from "../constants/messages";

export const LoadingState = () => (
  <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_50%_0%,#eaf1ff_0,transparent_46%),#f5f7fb] p-6" role="status" aria-live="polite" aria-busy="true">
    <section className="w-full max-w-[420px] rounded-2xl border border-line bg-surface px-8 py-10 text-center surface-shadow">
      <div className="relative mx-auto mb-5 grid size-16 place-items-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-strong text-xl font-semibold text-white shadow-[0_10px_24px_rgb(37_99_217/28%)]">D</div>
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-brand/15 border-t-brand motion-reduce:animate-none" aria-hidden="true" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand">{m.appName}</p>
      <h1 className="mt-2 text-xl font-semibold tracking-[-.03em] text-ink">{m.loadingTitle}</h1>
      <p className="mx-auto mt-2 max-w-[310px] text-[13px] leading-relaxed text-muted">{m.loadingHint}</p>
      <LoaderCircle className="mx-auto mt-5 size-5 animate-spin text-muted motion-reduce:animate-none" aria-hidden="true" />
    </section>
  </main>
);
