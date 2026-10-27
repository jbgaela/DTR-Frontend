import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar, cn } from "./ui";

type UserMenuProps = {
  name: string;
  position: string;
  settingsHref: string;
  variant?: "sidebar" | "compact";
  signingOut?: boolean;
  onSignOut: () => void;
};

export const UserMenu = ({ name, position, settingsHref, variant = "sidebar", signingOut = false, onSignOut }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    const timer = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}
        className={cn(
          "flex items-center gap-2.5 rounded-xl text-left transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          variant === "sidebar" ? "w-full border border-sidebar-line bg-sidebar-active/60 px-2.5 py-2.5 text-sidebar-text hover:bg-sidebar-active" : "p-1"
        )}
      >
        <Avatar name={name} size={variant === "sidebar" ? "md" : "sm"} className={variant === "sidebar" ? "bg-white/10 text-white" : ""} decorative={false} />
        {variant === "sidebar" ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">{name || "Employee"}</span>
              <span className="mt-0.5 block truncate text-[11px] text-sidebar-text">{position || "Profile not set"}</span>
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-sidebar-text transition-transform", open && "rotate-180")} aria-hidden="true" />
          </>
        ) : <ChevronDown className="size-3.5 text-muted" aria-hidden="true" />}
        <span className="sr-only">Account menu</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Account menu"
          className={cn(
            "absolute z-50 w-60 overflow-hidden rounded-xl border border-line bg-surface p-1.5 popover-shadow animate-enter",
            variant === "sidebar" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
          )}
        >
          <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
            <p className="truncate text-[13px] font-semibold text-ink">{name || "Employee"}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{position || "Profile not set"}</p>
          </div>
          <div className="pt-1.5">
            <Link
              to={settingsHref}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4 text-muted" aria-hidden="true" /> Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-danger hover:bg-danger-soft focus-visible:bg-danger-soft focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
              onClick={() => { setOpen(false); onSignOut(); }}
              disabled={signingOut}
            >
              <LogOut className="size-4" aria-hidden="true" /> {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
