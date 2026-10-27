import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown, LoaderCircle } from "lucide-react";
import type { Period } from "../api";
import { displayToIso, formatRangeLabel, isValidDisplayDate, isValidRange, isoToDisplay, periodKindLabel, semiMonthlyRangeForDisplay, shiftSemiMonthlyRange } from "../domain/date";
import { cn } from "./ui";

type Range = { startDate: string; endDate: string };

type PeriodSelectorProps = {
  period: Period;
  today: string;
  preparing: boolean;
  error?: string;
  onApply: (startDate: string, endDate: string) => Promise<boolean>;
};

export const PeriodSelector = ({ period, today, preparing, error, onApply }: PeriodSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(() => displayToIso(period.startDate));
  const [end, setEnd] = useState(() => displayToIso(period.endDate));
  const [localError, setLocalError] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 12 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(370, window.innerWidth - 24);
    setPosition({ top: rect.bottom + 8, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) });
  }, []);

  const base = semiMonthlyRangeForDisplay(today);
  const quickRanges: Array<{ label: string; range: Range | null }> = [
    { label: "This cutoff", range: base },
    { label: "Previous", range: base ? shiftSemiMonthlyRange(base, -1) : null },
    { label: "Next", range: base ? shiftSemiMonthlyRange(base, 1) : null }
  ];

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleViewport = () => updatePosition();
    updatePosition();
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleViewport);
    window.addEventListener("scroll", handleViewport, true);
    const timer = window.setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleViewport);
      window.removeEventListener("scroll", handleViewport, true);
      window.clearTimeout(timer);
    };
  }, [open, updatePosition]);

  const toggle = () => {
    if (!open) {
      setStart(displayToIso(period.startDate));
      setEnd(displayToIso(period.endDate));
      setLocalError("");
      updatePosition();
    }
    setOpen((value) => !value);
  };

  const apply = async (startIso: string, endIso: string) => {
    setLocalError("");
    const startDate = isoToDisplay(startIso);
    const endDate = isoToDisplay(endIso);
    if (!isValidDisplayDate(startDate) || !isValidDisplayDate(endDate)) {
      setLocalError("Choose a valid start and end date.");
      return;
    }
    if (!isValidRange(startDate, endDate)) {
      setLocalError("The start date must be on or before the end date.");
      return;
    }
    const applied = await onApply(startDate, endDate);
    if (applied) setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className="flex min-h-10 items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-line-strong hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-3"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
          {preparing ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> : <CalendarDays className="size-4" />}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block text-[10px] font-semibold uppercase tracking-[.12em] text-muted">Current period</span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold text-ink">{formatRangeLabel(period.startDate, period.endDate)}</span>
        </span>
        <span className="max-w-[9rem] truncate text-[13px] font-semibold text-ink sm:hidden">{formatRangeLabel(period.startDate, period.endDate)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Reporting period"
          style={{ top: position.top, left: position.left }}
          className="fixed z-50 max-h-[calc(100dvh-6rem)] w-[min(370px,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-line bg-surface p-4 popover-shadow animate-enter"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Reporting period</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">This changes the data shown across every screen.</p>
            </div>
            <button type="button" className="rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-canvas hover:text-ink" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="mt-4 grid gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">Shortcuts</p>
            {quickRanges.map((option) => {
              const range = option.range;
              if (!range) return null;
              const selected = start === displayToIso(range.startDate) && end === displayToIso(range.endDate);
              const active = period.startDate === range.startDate && period.endDate === range.endDate;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => { setStart(displayToIso(range.startDate)); setEnd(displayToIso(range.endDate)); setLocalError(""); }}
                  className={cn("flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors", selected ? "border-brand/30 bg-brand-soft" : "border-transparent hover:bg-canvas")}
                  aria-pressed={selected}
                >
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-brand bg-brand text-white" : "border-line-strong text-transparent")} aria-hidden="true"><Check className="size-3" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{option.label}</span>
                    <span className="block text-[11px] text-muted">{formatRangeLabel(range.startDate, range.endDate)}</span>
                  </span>
                  {active && <span className="text-[10px] font-semibold uppercase tracking-wide text-brand">Active</span>}
                </button>
              );
            })}
          </div>

          <form className="mt-4 border-t border-line pt-4" onSubmit={(event) => { event.preventDefault(); void apply(start, end); }}>
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">Custom range</p>
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              <label className="grid gap-1 text-xs font-medium text-ink">
                Start date
                <input ref={firstInputRef} type="date" value={start} onChange={(event) => { setStart(event.target.value); setLocalError(""); }} className="min-h-10 w-full rounded-lg border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
              </label>
              <label className="grid gap-1 text-xs font-medium text-ink">
                End date
                <input type="date" value={end} onChange={(event) => { setEnd(event.target.value); setLocalError(""); }} className="min-h-10 w-full rounded-lg border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
              </label>
            </div>
            {(localError || error) && <p className="mt-2.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium leading-relaxed text-danger" role="alert">{localError || error}</p>}
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted">{periodKindLabel(isoToDisplay(start), isoToDisplay(end))}</p>
              <div className="flex gap-2">
                <button type="button" className="min-h-9 rounded-lg px-3 text-[13px] font-semibold text-muted hover:bg-canvas hover:text-ink" onClick={() => setOpen(false)} disabled={preparing}>Cancel</button>
                <button type="submit" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white hover:bg-brand-strong disabled:cursor-wait disabled:opacity-70" disabled={preparing}>
                  {preparing && <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {preparing ? "Loading period..." : "Load period"}
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};
