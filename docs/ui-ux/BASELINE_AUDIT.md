# Baseline audit

**Date:** October 27, 2026  
**Scope:** `C:\Projects\React\DTR\frontend` (Git repository on `main`)  
**Authoritative backend:** `C:\Projects\NodeJs\DTR\DTR-Backend`  
**Baseline commit:** `113b268 Feature: Created Excel export fix`

## 1. Repository and baseline checks

The React frontend is its own Git repository. The workspace root (`C:\Projects\React\DTR`) is not a Git repository, so the committed UI/UX documentation lives in `frontend/docs/ui-ux/`.

Baseline commands were run before source changes:

| Command | Result |
| --- | --- |
| `npm run check` (root) | Passed: backend `node --check` and frontend `tsc --noEmit` |
| `npm run build` (frontend) | Passed: 88 modules, 268.32 kB JS (80.58 kB gzip), 29.52 kB CSS (6.35 kB gzip) |
| Frontend automated tests | None configured |
| Backend automated tests | 16 `node --test` cases existed in the bundled backend |

Baseline screenshots were supplied in `Handoff/screenshots/` and were not overwritten.

## 2. Existing architecture

- React 19, TypeScript, Vite 8, Tailwind CSS 4, TanStack Query 5, Radix Dialog dependency.
- `App.tsx` owned the active screen in local state and rendered one of six authenticated views.
- `useDtrApp.ts` loaded session/current period, owned form mutations, and exposed a flat state object.
- `api.ts` used same-origin credentialed JSON requests and display dates in `MM/DD/YYYY`.
- Backend calculations were authoritative through `/api/daily-hours/preview` and the save endpoint.
- `styles.css` contained a small Tailwind theme and almost no shared component system.
- `components/ui.tsx` contained only `Field`, `Button`, and `Card`.

## 3. UX and component findings

### Shell and navigation

- Screen changes did not create URL history; refresh returned to Dashboard.
- No visible logout action existed even though `api.logout()` was defined.
- Period controls (two text inputs + button) repeated in the global header and consumed a large amount of space.
- Navigation was a horizontal scroll row below 800 px rather than a mobile navigation pattern.
- No skip link, route announcement, or visible global focus treatment.

### Dashboard

- Completion used `dailyRecords.length` without distinguishing missing past dates from upcoming dates.
- Date tiles did not show day type for saved entries, entry state, today, or explicit navigation affordance.
- Summary showed regular hours, day overtime, and **combined** rest-day + rest-day OT, while omitting night OT as a separate category.
- No "next action" or "all dates complete" treatment beyond a text line.
- Hero copy and large cards consumed vertical space.

### Daily Entry

- One long card sequence with no desktop side summary or mobile action hierarchy.
- `Clear day` was used for both draft reset and destructive deletion.
- No unsaved-change protection for date, route, period, or browser refresh.
- No client-side field validation or focus-to-error.
- Task textarea was labelled "One accomplishment per line" rather than "Task lines".
- Override labels contained duplicates/wrong meanings (`nightDiffMinutes` and `nightDiffOtMinutes` both labelled "Night OT hours").
- Manual override fields appeared only in the attendance card, far from the calculated totals.
- No explicit distinction between preview values, saved values, unavailable previews, and stale values.

### Period Review

- Only saved records were shown; no completion or missing-date context.
- No filters, no record count, no mobile card presentation.
- The hour columns were readable but ungrouped, and the action said `Daily entry` rather than `Edit`.
- The table had no accessible caption.

### Leave

- Draft was initialized only on mount; changing the cutoff while the view lingered could leave the previous period's draft visible.
- No validation for date order, day count, or reason.
- The destructive action reused the label `Clear day`.
- The form did not show the active period or saved-request state next to the fields.

### Settings

- No field grouping beyond two cards.
- No validation, no dirty-state warning, and no success/error feedback close to the action.
- `regularLimitMinutes` and `workdayMask` were presented without explaining that calculations currently use a fixed 8-hour threshold.
- The shared-profile behavior was not explained to the user.

### Exports

- Direct anchor links gave no in-app success, failure, or session-expiry feedback.
- No completeness context for missing dates.
- No explanation of what each workbook contains.

### Login

- Layout was visually heavy; no password visibility control.
- The form did not disable duplicate submissions explicitly.
- No route-aware post-login return.

## 4. Accessibility baseline

- Some labels were associated through a wrapper component; most inputs had usable labels.
- Alerts existed for save failures and preview status, but there was no skip link, no route announcements, limited focus styling, and no dialog pattern for destructive actions.
- Buttons and links were mixed for navigation.
- Color contrast had not been audited.
- Mobile touch targets were inconsistent (for example, icon/action controls were text-only).
- Reduced motion was not handled globally.

## 5. Data and backend caveats confirmed in source

- API date format remains `MM/DD/YYYY`; ISO dates are accepted by the backend but responses are display-formatted.
- `regularLimitMinutes` and `workdayMask` are persisted but not used by current backend calculations.
- The backend uses a fixed 8-hour regular threshold and trusts the submitted day type.
- The profile is a single shared `primary` profile, not scoped per authenticated user.
- One leave request is attached to one reporting period.
- Night OT (`nightDiffOtMinutes`) and day overtime (`regularOtMinutes`) are separate buckets; rest-day OT is separate from rest-day hours.
- Server validation rejects a timed `WORKDAY` entry with less than 8 regular hours.

## 6. Baseline risks and refactoring boundaries

| Risk | Baseline impact | Boundary used in this redesign |
| --- | --- | --- |
| Calculation drift | Frontend display could disagree with server | No frontend calculation rules; preview/save endpoints unchanged |
| Date drift | Display vs URL vs UTC conversions | Centralized date helpers in `domain/date.ts`; ISO only inside the browser URL and date inputs |
| Silent data loss | Date/period/route changes discarded drafts | Shared unsaved guard plus browser `beforeunload` |
| Export contract | Company templates and filenames | Backend endpoints untouched; fetch/blob only changes transport |
| Shared profile | Multi-user isolation is not implemented | Documented in Settings; no implied ownership |
| Inactive settings | Operators may expect `regularLimitMinutes` to work | Helper text and warning state the fixed backend threshold |
| Missing test runner | No regression signal | Vitest + Testing Library added with domain and component coverage |

## 7. Proposed boundaries that were kept

- No backend schema, calculation, authentication, or workbook-template changes.
- No new leave approval workflow, entitlement balance, or multiple-request history.
- No invented attendance statuses or holiday rules.
- No payroll calculation changes.
- Visual redesign did not change API field names, response shapes, or export URLs.

## 8. Deliverables produced from this audit

- Shared design system and tokens.
- URL-routed responsive application shell with mobile navigation.
- Redesigned Login, Dashboard, Daily Entry, Period Review, Leave, Settings, and Exports.
- Client-side validation, unsaved-change protection, destructive-action confirmation, and accessible feedback states.
- Test suite and documented verification results.
- No backend source changes.
