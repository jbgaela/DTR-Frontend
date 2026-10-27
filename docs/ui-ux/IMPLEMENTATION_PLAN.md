# Implementation plan and decisions

## 1. Sequence used

| Stage | Work | Outcome |
| --- | --- | --- |
| 0 | Repository audit and baseline | `BASELINE_AUDIT.md`; baseline check/build recorded |
| 1 | Design tokens and domain utilities | Theme, typography, spacing, shared primitives, date/record/progress/validation modules |
| 2 | Application shell and routing | React Router, URL periods and dates, sidebar, mobile drawer, bottom navigation, period selector, account menu |
| 3 | Daily Entry | Date navigation, grouped attendance/accomplishments, preview/override states, save/reset/delete, unsaved guard |
| 4 | Dashboard | Completion, next action, future-only/complete states, date overview, exact category summary |
| 5 | Period Review | Summary, filters, desktop table, mobile cards, edit navigation |
| 6 | Leave | Period-aware draft state, validation, saved-request context, delete confirmation |
| 7 | Settings | Grouped fields, validation, dirty guard, shared-profile and inactive-setting explanations |
| 8 | Exports | Workbook cards, completeness and missing-name warnings, fetch/blob download, error handling |
| 9 | Login | Split branding/auth layout, password visibility, pending/error states |
| 10 | Cross-screen polish | Skip link, live region, scroll reset, focus rings, reduced motion, 360–2560 verification |
| 11 | Tests and verification | Vitest/RTL suite, axe-core audit, responsive probe, disposable backend/Mongo E2E |
| 12 | Documentation and commit | This handoff set and the `main` commit |

## 2. Architectural decisions

### URL routing

React Router was added because the redesign requires browser history, direct navigation, and refresh-safe screens. Routes are:

- `/dashboard`
- `/daily?date=YYYY-MM-DD`
- `/review`
- `/leave`
- `/settings`
- `/exports`
- `/login`

The active reporting range is stored as `start=YYYY-MM-DD&end=YYYY-MM-DD` on every authenticated route. Display values remain `MM/DD/YYYY` at the API boundary.

### Backend-selected default range

When no range is in the URL, the client calls the backend current-period endpoint **without** range parameters. The backend chooses the default cutoff using the profile timezone. The client then writes that range into the URL and seeds the explicit-range cache, avoiding a duplicate fetch. This keeps the default period aligned with `Asia/Manila` rather than the browser machine’s date.

### Unsaved-change protection

A single provider in `App.tsx` tracks whether the current screen is dirty. Pages register through `usePageDirty`. Router navigation is blocked with `useBlocker`; browser close/refresh uses `beforeunload`; period changes and sign-out use a shared confirmation dialog. Period changes that are intentionally confirmed discard state before navigation, and period-aware views reset when the period id changes.

### Authoritative calculation boundaries

The frontend never recalculates payroll buckets. `useDailyHoursPreview` remains server-backed with the existing 200 ms debounce. Saved values are shown only when the current input signature matches the saved record signature. Changed inputs show preview values only after the server responds; stale values are never presented as current.

### Category presentation

Night OT and day overtime are separate backend buckets, as are rest-day and rest-day OT. The new UI displays each category explicitly rather than inventing a combined total. The dashboard keeps regular, day overtime, night OT, and rest-day hours as separate metrics; Period Review lists all seven buckets.

### Data fetching and cache updates

TanStack Query keys remain stable. Save/delete/profile/leave mutations update the current period cache and invalidate all `current-period` keys. Optimistic UI is not used for authoritative hour values. The session query treats a 401 as “unauthenticated” rather than a fatal error; any authenticated endpoint 401 clears the session and prompts re-login.

### Export transport

The export endpoints are unchanged. The UI now downloads through `fetch` with credentials, reads the filename from `Content-Disposition`, creates a blob link, and surfaces real request errors. This preserves workbook generation and file names while fixing silent session-expiry failures.

## 3. Dependency decisions

| Dependency | Reason | Cost |
| --- | --- | --- |
| `react-router-dom` | URL routing, history, blockers | ~1 chunk; routes lazy-loaded |
| `lucide-react` | Consistent accessible icon set | Tree-shaken icons |
| `@fontsource-variable/inter` | Local Inter without a runtime font request | Font files split by unicode range; browser loads Latin |
| `vitest`, `jsdom`, Testing Library | Automated logic/component tests | Dev-only |
| `axe-core` | Accessibility audit via an external probe | Not shipped; audit tool only |
| Existing Radix Dialog | Accessible confirmations and mobile drawer | Already present |

No new state library, animation library, CSS-in-JS, or component framework was introduced. Tailwind remains the styling layer; custom CSS is limited to tokens, focus/motion rules, and utilities.

## 4. Deliberate non-changes

- No backend source changes.
- No schema, calculation, authentication, or workbook-template changes.
- No new leave approval/status workflow.
- No entitlement balances or multiple leave requests.
- No user-scoped profile implementation.
- No new holiday rules or attendance statuses.
- `regularLimitMinutes` remains editable but is explicitly described as inactive in current calculations.
- `workdayMask` remains persisted, not exposed as an operational control, and not used by calculations.

## 5. Deviations from the proposed plan

| Proposed | Implemented | Reason |
| --- | --- | --- |
| Separate visual-regression test suite | Manual screenshot captures in `screenshots/` and repeatable CDP probes | No Playwright dependency or CI runner was configured; adding a full browser suite would be a larger separate contract |
| Playwright E2E suite | Real-backend API and browser E2E executed manually; fixture-based browser checks | Same reason; documented as a next step |
| Combined “total hours” card | Omitted | Backend buckets overlap semantically (night OT is overtime; rest-day OT is separate); adding them would imply an unverified payroll total |
| Toast library | Small local `Toast` component | One notification at a time is sufficient; avoids a dependency |
| Popover library | Portal-based `PeriodSelector`/`UserMenu` with keyboard dismissal | Keeps dependencies small; Radix Dialog remains for modal semantics |

## 6. Rollback strategy

The redesign is a frontend-only change. Roll back by reverting the frontend commit on `main` and redeploying the previous Vercel build. No database migration or API contract rollback is required. Company workbook output remains generated by the unchanged backend.
