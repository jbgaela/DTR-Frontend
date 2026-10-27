import * as Dialog from "@radix-ui/react-dialog";
import { NavLink, useLocation } from "react-router-dom";
import { CalendarDays, CalendarMinus, FileSpreadsheet, LayoutDashboard, ListChecks, LogOut, Menu, Settings, X } from "lucide-react";
import type { Profile } from "../api";
import { messages as m } from "../constants/messages";
import { Avatar, cn } from "./ui";

type MobileNavigationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  attentionCount: number;
  periodSearch: string;
  dailySearch: string;
  signingOut: boolean;
  onSignOut: () => void;
};

const primary = (periodSearch: string, dailySearch: string, attentionCount: number) => [
  { label: m.dashboard, short: "Home", to: `/dashboard${periodSearch}`, icon: LayoutDashboard, badge: 0 },
  { label: m.dailyEntry, short: "Entry", to: `/daily${dailySearch}`, icon: CalendarDays, badge: attentionCount },
  { label: m.periodReview, short: "Review", to: `/review${periodSearch}`, icon: ListChecks, badge: 0 },
  { label: m.leave, short: "Leave", to: `/leave${periodSearch}`, icon: CalendarMinus, badge: 0 }
];

const secondary = (periodSearch: string) => [
  { label: m.exports, short: "Exports", to: `/exports${periodSearch}`, icon: FileSpreadsheet, badge: 0 },
  { label: m.settings, short: "Settings", to: `/settings${periodSearch}`, icon: Settings, badge: 0 }
];

const bottomClass = ({ isActive }: { isActive: boolean }) => cn(
  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
  isActive ? "text-brand" : "text-muted hover:text-ink"
);

export const MobileNavigation = ({ open, onOpenChange, profile, attentionCount, periodSearch, dailySearch, signingOut, onSignOut }: MobileNavigationProps) => {
  const location = useLocation();
  const moreActive = location.pathname === "/exports" || location.pathname === "/settings";
  const allItems = [...primary(periodSearch, dailySearch, attentionCount), ...secondary(periodSearch)];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Primary navigation">
        <div className="grid h-14 grid-cols-5">
          {primary(periodSearch, dailySearch, attentionCount).map((item) => (
            <NavLink key={item.label} to={item.to} className={bottomClass}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand" aria-hidden="true" />}
                  <span className="relative">
                    <item.icon className="size-5" aria-hidden="true" />
                    {Boolean(item.badge) && <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-warning px-1 text-[9px] font-bold leading-4 text-white" aria-hidden="true">{item.badge}</span>}
                  </span>
                  <span>{item.short}<span className="sr-only"> — {item.label}{item.badge ? `, ${item.badge} ${item.badge === 1 ? "date needs" : "dates need"} attention` : ""}</span></span>
                </>
              )}
            </NavLink>
          ))}
          <button type="button" className={cn(bottomClass({ isActive: moreActive }), "w-full")} aria-haspopup="dialog" aria-expanded={open} onClick={() => onOpenChange(true)}>
            {moreActive && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand" aria-hidden="true" />}
            <Menu className="size-5" aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(320px,86vw)] flex-col overflow-y-auto border-r border-sidebar-line bg-sidebar px-4 py-5 text-white shadow-[20px_0_60px_rgb(8_20_38/28%)] data-[state=open]:animate-slide-in">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#5c96ff] to-brand text-lg font-semibold text-white" aria-hidden="true">D</span>
                <span>
                  <strong className="block text-sm font-semibold text-white">{m.appName}</strong>
                  <span className="mt-0.5 block text-[10px] text-sidebar-text">Attendance & accomplishments</span>
                </span>
              </div>
              <Dialog.Close asChild>
                <button type="button" className="grid size-9 place-items-center rounded-lg text-sidebar-text hover:bg-white/10 hover:text-white" aria-label="Close navigation"><X className="size-4" aria-hidden="true" /></button>
              </Dialog.Close>
            </div>

            <nav className="mt-7 flex-1" aria-label="Mobile navigation">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-sidebar-text/85">Workspace</p>
              <div className="grid gap-1">
                {allItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => onOpenChange(false)}
                    className={({ isActive }) => cn("relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium", isActive ? "bg-sidebar-active text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white")}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#8bb6ff]" aria-hidden="true" />}
                        <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {Boolean(item.badge) && <><span className="rounded-full bg-[#3a5a86]/70 px-1.5 py-0.5 text-[10px] font-semibold text-[#dbe9ff]" aria-hidden="true">{item.badge}</span><span className="sr-only">{" "}{item.badge} {item.badge === 1 ? "date needs" : "dates need"} attention</span></>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="mt-5 border-t border-sidebar-line pt-4">
              <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5">
                <Avatar name={profile.employeeName} size="md" className="bg-white/10 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{profile.employeeName || "Employee"}</p>
                  <p className="mt-0.5 truncate text-[11px] text-sidebar-text">{profile.position || "Profile not set"}</p>
                </div>
              </div>
              <button type="button" onClick={onSignOut} disabled={signingOut} className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#ffb4b4] hover:bg-white/5 disabled:cursor-wait disabled:opacity-60">
                <LogOut className="size-4" aria-hidden="true" /> {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
