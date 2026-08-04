import { messages as m } from "../constants/messages";

export const LoadingState = () => <main className="grid min-h-screen min-h-[100dvh] place-items-center bg-[radial-gradient(circle_at_50%_0%,#eaf2ff_0,transparent_44%),#f5f7fb] p-6" role="status" aria-live="polite" aria-busy="true">
  <section className="w-full max-w-[430px] rounded-[22px] border border-[#dce7f7] bg-white px-[30px] pb-10 pt-11 text-center shadow-[0_24px_60px_rgb(24_55_97/8%)]">
    <div className="relative mx-auto mb-6 grid size-[84px] place-items-center" aria-hidden="true">
      <div className="relative z-10 grid size-[54px] place-items-center rounded-[17px] bg-gradient-to-br from-[#72a9ff] to-[#3d78e4] text-[25px] font-extrabold text-white shadow-[0_9px_20px_rgb(51_120_232/24%)]">D</div>
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#dbe7fb] border-r-[#72a9ff] border-t-brand motion-reduce:animate-none" />
    </div>
    <p className="mb-0 text-[11px] font-bold uppercase tracking-[.08em] text-[#6684ad]">{m.appName}</p>
    <h1 className="my-2 mb-2.5 text-[25px] font-bold tracking-[-.04em] text-ink">{m.loadingTitle}</h1>
    <p className="mx-auto my-0 max-w-[320px] text-[13px] leading-relaxed text-[#71819a]">{m.loadingHint}</p>
  </section>
</main>;
