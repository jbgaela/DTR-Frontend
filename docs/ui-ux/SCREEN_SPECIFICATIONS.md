# Screen specifications

## Shared shell

**Purpose:** Persistent orientation, period context, account actions, and responsive navigation.

- Desktop (`≥1024 px`): fixed 264 px sidebar; logo, primary nav (Dashboard, Daily entry, Period review, Leave form), workspace nav (Exports, Settings), account menu.
- Tablet/mobile (`<1024 px`): sticky 64 px top bar with menu button, compact period selector, account avatar; fixed bottom navigation with Home, Entry, Review, Leave, More.
- Mobile “More” opens a Radix drawer with all routes, account identity, and sign out.
- Active navigation has a background and a left/top indicator; it does not rely on color alone.
- The top bar owns the reporting-period selector, profile timezone chip, and mobile account menu.
- The current period selector opens a portal panel anchored under the trigger. It offers This cutoff / Previous / Next shortcuts and a custom ISO range. Loading is explicit; server errors stay in the panel.
- Skip link targets `#main-content`; a polite live region announces the route name; route changes reset scroll to top.
- Unsaved screens register with the shell; navigation, period changes, sign-out, refresh, and tab close are protected.

## Login

**Purpose:** Authenticate with the existing session API.

- Desktop: brand panel (identity, headline, feature list, security note) + authentication card.
- Mobile: compact brand header + form; decorative panel removed.
- Fields: username, password, password visibility toggle.
- Enter submits; duplicate submissions disabled while pending; credentials preserved after recoverable errors.
- Errors are shown in a role=alert region. No password reset or registration flow is offered.
- On success, the user returns to the requested app route; otherwise Dashboard.

## Dashboard

**Purpose:** Answer “How complete is this cutoff?”, “What needs attention?”, “What should I do next?”.

1. **Page heading:** greeting, active range/kind, Review period and Add daily entry actions.
2. **Completion panel:** ring, percentage, entered/missing/upcoming counts, progress bar, active-period chips.
3. **Next action panel:** earliest missing past/current date, today’s missing entry, or a completed/upcoming state. Future-only periods are not called overdue or complete.
4. **Metrics:** regular, day overtime, night OT, rest-day hours. Hints state that night OT and rest-day OT are separate.
5. **Date overview:** every date in the range; saved (day type), missing, today, upcoming; saved rest days count as complete even with zero hours; clicking any tile opens Daily Entry.
6. **Recent entries and period summary:** latest saved dates plus all seven authoritative categories.

Empty, partial, complete, and future-only states are distinct. No combined total hours are shown.

## Daily Entry

**Purpose:** Record or correct one date without leaving the screen.

1. **Date navigation:** long date heading, previous/next, native date input constrained to the period, Today shortcut when applicable.
2. **Attendance:** day type, calculation mode, time in/out, break, overnight clock-out. New workday drafts are prefilled from the profile shift start/end and standard break. If both times are cleared on a workday, the preview uses the shift start/end and Save persists those shift times; the form explains this and offers “Use shift times.” Rest, leave, and absent drafts are not auto-filled. Leave/absent disable time controls but retain stored draft values. Changing to workday applies the profile break only when break is currently zero and fills shift times only when both are empty.
3. **Accomplishments:** activity, type, status, hours spent, task lines, remarks. One task per line; blank lines are filtered; 100-task/2,000-character limits are validated.
4. **Calculated hours:** seven categories; preview state (calculating, ready, saved, unavailable); warning when a timed workday is below the server’s 8-hour regular minimum; manual override fields with exact category names.
5. **Actions:** Save entry, Discard changes/Clear draft, Delete entry (saved records only, confirmed). Save is disabled for an unchanged saved record. Failed saves preserve the form and show the server error.

Client validation focuses the first invalid field. Unsaved changes are protected on date, route, period, refresh, and sign-out. A successful save updates the cache, resets the baseline, and shows a toast only after persistence succeeds.

## Period Review

**Purpose:** Verify saved records and exact categories.

- Header: range, kind, entered count, Export workbooks, Add missing entry.
- Summary: saved records, regular, overtime, rest-day hours.
- Missing/upcoming alert with next-missing shortcut.
- Filters: All saved, Workdays, Rest days, Leave/absent, With overtime.
- Desktop table: date, day type, regular, OT, night differential, night OT, rest day, rest OT, holiday, Edit. Numeric cells are right-aligned and tabular; the table scrolls inside its card.
- Mobile: equivalent record cards.
- Empty period and empty filter states.
- No frontend edit path that bypasses the server; Edit opens the daily record.

## Leave

**Purpose:** Manage the one leave request attached to the active period.

- Main card: date filed, leave type, from/to, number of days, reason. Date order/day/reason validation; calendar span is informational only and is not presented as a policy-day calculation.
- Period side panel: active range, saved request state, type/dates/days.
- Changing the period resets the draft to that period’s request (or blank) after confirmation when dirty.
- Save, discard, and delete actions; delete requires confirmation and names the period.
- Shared backend limitation (one request per period) is stated in the UI.

## Settings

**Purpose:** Maintain the shared employee/profile and attendance configuration.

- Employee information: name (required), ID, position, project assignment.
- Validation/signoff: validator and supervisor.
- Attendance: shift start/end, standard break, regular-hour limit. Shift start/end also seed new workday time in/out defaults; helper text explains this.
- Night differential: start/end, with midnight-crossing explanation.
- Reporting timezone is displayed read-only.
- Shared-profile warning explains that the backend stores one primary profile.
- Regular-hour limit warning explains that current calculations use a fixed 8-hour threshold.
- Dirty state, discard, save, success/error feedback, and period-independent draft preservation.
- Sticky action bar keeps Save/Discard accessible.

## Exports

**Purpose:** Download company workbooks with honest feedback and completeness context.

- Header: range, kind, Review period.
- Missing employee name warning with Settings action.
- Completeness warning distinguishes missing past/current dates from upcoming dates; it does not block export.
- DTR workbook card: description, XLSX label, saved-date count, template note, range, Download DTR.
- Accomplishments workbook card: description, XLSX label, dates-with-tasks count, template note, range, Download accomplishments.
- Downloads use fetch/blob with credentials; loading says “Preparing workbook…”; errors are specific; no fabricated progress percentage.
- Included-content card explains attendance, leave/signoff, and accomplishments data.
