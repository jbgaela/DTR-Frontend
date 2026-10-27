import { NavLink } from "react-router-dom";
import { CalendarDays, CalendarMinus, FileSpreadsheet, LayoutDashboard, ListChecks, Settings } from "lucide-react";
import type { Profile } from "../api";
import { messages as m } from "../constants/messages";
import { cn } from "./ui";
import { UserMenu } from "./UserMenu";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

const primaryItems = (periodSearch: string, dailySearch: string, attentionCount: number): NavItem[] => [
  { label: m.dashboard, to: `/dashboard${periodSearch}`, icon: LayoutDashboard },
  { label: m.dailyEntry, to: `/daily${dailySearch}`, icon: CalendarDays, badge: attentionCount },
  { label: m.periodReview, to: `/review${periodSearch}`, icon: ListChecks },
  { label: m.leave, to: `/leave${periodSearch}`, icon: CalendarMinus }
];

const workspaceItems = (periodSearch: string): NavItem[] => [
  { label: m.exports, to: `/exports${periodSearch}`, icon: FileSpreadsheet },
  { label: m.settings, to: `/settings${periodSearch}`, icon: Settings }
];

const itemClass = ({ isActive }: { isActive: boolean }) => cn(
  "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bb6ff] focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
  isActive ? "bg-sidebar-active text-white" : "text-sidebar-text hover:bg-white/5 hover:text-white"
);

const NavRow = ({ item }: { item: NavItem }) => (
  <NavLink to={item.to} className={itemClass}>
    {({ isActive }) => (
      <>
        {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#8bb6ff]" aria-hidden="true" />}
        <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {Boolean(item.badge) && <><span className="rounded-full bg-[#3a5a86]/70 px-1.5 py-0.5 text-[10px] font-semibold text-[#dbe9ff]" aria-hidden="true">{item.badge}</span><span className="sr-only">{" "}{item.badge} {item.badge === 1 ? "date needs" : "dates need"} attention</span></>}
      </>
    )}
  </NavLink>
);

export const Sidebar = ({ profile, attentionCount, periodSearch, dailySearch, settingsHref, signingOut, onSignOut }: { profile: Profile; attentionCount: number; periodSearch: string; dailySearch: string; settingsHref: string; signingOut: boolean; onSignOut: () => void }) => (
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-sidebar-line bg-sidebar px-3.5 py-5 lg:flex">
    <div className="flex items-center gap-3 px-2">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#5c96ff] to-brand text-lg font-semibold text-white shadow-[0_8px_20px_rgb(0_0_0/20%)]" aria-hidden="true">D</span>
      <span className="min-w-0">
        <strong className="block truncate text-sm font-semibold text-white">{m.appName}</strong>
        <span className="mt-0.5 block truncate text-[10px] leading-tight text-sidebar-text">Attendance & accomplishments</span>
      </span>
    </div>

    <nav className="mt-8 flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Primary navigation">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-sidebar-text/85">Workspace</p>
      <div className="grid gap-1">
        {primaryItems(periodSearch, dailySearch, attentionCount).map((item) => <NavRow key={item.label} item={item} />)}
      </div>

      <div className="my-5 border-t border-sidebar-line" role="presentation" />
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-sidebar-text/85">Reports & settings</p>
      <div className="grid gap-1">
        {workspaceItems(periodSearch).map((item) => <NavRow key={item.label} item={item} />)}
      </div>
    </nav>

    <div className="mt-4 border-t border-sidebar-line pt-4">
      <UserMenu name={profile.employeeName} position={profile.position} settingsHref={settingsHref} signingOut={signingOut} onSignOut={onSignOut} />
    </div>
  </aside>
);
