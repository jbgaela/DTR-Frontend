import { messages as m } from "../constants/messages";

export const LoadingState = () => <main className="loading-state" role="status" aria-live="polite" aria-busy="true">
  <section className="loading-card">
    <div className="loading-visual" aria-hidden="true">
      <div className="loading-mark">D</div>
      <span className="loading-spinner" />
    </div>
    <p className="eyebrow">{m.appName}</p>
    <h1>{m.loadingTitle}</h1>
    <p className="loading-copy">{m.loadingHint}</p>
  </section>
</main>;
