# Regression report

## 1. Contract compatibility

| Area | Status |
| --- | --- |
| Authentication endpoints | Unchanged; login/session/logout verified |
| Session cookie credentials | Preserved (`credentials: "include"`) |
| Current period and range parameters | Unchanged display-date contract |
| Daily preview | Unchanged endpoint, payload, debounce, and server authority |
| Daily save/delete | Unchanged endpoints, path/query date variants, and payload fields |
| Profile read/update | Unchanged fields and validation boundary |
| Leave read/update/delete | Unchanged one-request-per-period contract |
| DTR export | Unchanged endpoint, template, layout, and filename |
| Accomplishments export | Unchanged endpoint, template, layout, and filename |
| Backend source | No changes made |
| Database schema | No changes made |

Date handling remains `MM/DD/YYYY` at the API boundary. ISO `YYYY-MM-DD` is used only in browser URLs and native date inputs; conversion helpers are centralized in `domain/date.ts`.

## 2. Workflows verified

- Valid login, session restoration, logout, and post-logout 401.
- Direct navigation to authenticated routes and refresh.
- Period shortcut and custom-range changes; browser history.
- Dashboard missing/complete/future-only states.
- Daily entry create, edit, preview, save, reset, and delete confirmation.
- Overnight and leave/absent presentation rules.
- Manual override field submission.
- Unsaved-change prompt on period change, route change, date change, and sign-out.
- Period Review filtering and edit navigation.
- Leave save/load/delete and period-switch draft reset.
- Settings validation and save.
- Both workbook exports with a real backend.
- Session expiration path in code (401 clears session and shows re-login); backend logout/session behavior verified.

## 3. Intentional behavior changes

### URL routing

The app now has real routes and browser history. Refreshing preserves the active screen, period, and selected date. Invalid dates/ranges fall back safely.

### Backend-default reporting range

When the URL has no range, the client no longer substitutes the browser’s cutoff. It asks the backend for the default period (profile timezone) and then normalizes the URL. This prevents Manila/browser date drift at cutoff boundaries.

### Logout

The visible account menu now calls the existing logout endpoint. Previously the API existed but was not wired into the UI.

### Export transport

Exports still use the same endpoints and templates, but are fetched as authenticated blobs so that session expiry and server errors can be shown. File naming from `Content-Disposition` is preserved.

### Dashboard categories

The baseline dashboard showed day overtime only and combined rest-day + rest-day OT. The redesign displays separate regular, day overtime, night OT, and rest-day values, with a full seven-category period summary. No total-hours calculation was invented because the buckets are not mutually exclusive.

### Date display

API/display dates remain `MM/DD/YYYY`; formatted labels such as “Oct 16 – 31, 2026” are presentation only. Native date inputs use ISO values.

### Client validation

The UI now blocks clearly invalid input before the API call (missing paired times, out-of-range values, invalid leave ranges, empty required profile name, task limits). The backend remains authoritative and its validation errors are still surfaced.

### Unsaved-change protection

Drafts are protected by a shared guard. Resetting a draft and deleting a stored record are separate actions. `Clear day` was removed.

### Shift-based workday defaults

New workday drafts are prefilled with the profile shift start/end (and standard break), so a normal workday can be recorded without typing times. If both time fields are cleared on a workday, the preview uses the shift schedule and Save persists those shift times; a visible note and “Use shift times” action keep the behavior explicit. Rest days, leave, and absent days remain empty. This is input defaulting only — the backend still calculates and validates all hours from the submitted times.

### Lazy route loading

Daily Entry, Review, Leave, Settings, and Exports are lazy-loaded. Dashboard and Login remain in the initial bundle. PDF/browser behavior is unaffected.

## 4. Known issues and limitations

| Issue | Impact | Disposition |
| --- | --- | --- |
| Shared primary profile | All authenticated sessions read/write the same profile | Documented in Settings; requires a separate backend ownership task |
| `regularLimitMinutes` inactive | Editing it does not change calculations | Explicit helper text and warning; no calculation change |
| `workdayMask` inactive | Weekend rest-day defaults are frontend-only; backend trusts day type | Not exposed as an operational control; documented |
| No holiday calendar | Users choose Holiday manually | Out of scope; no new rules invented |
| No per-user data isolation | Not a UI concern; security/data-model risk | Reported explicitly; not hidden by the redesign |
| No automated browser E2E | Regression checks are manual/scripted probes | Listed as next step |
| No screen-reader certification | Automated axe and keyboard smoke only | Listed as next step |
| Review table scrolls at tablet widths | Intentional; all categories retained | Internal scroll, page does not overflow |
| Fixed bottom navigation | Covers content while scrolling on small screens | Main content has bottom padding; all controls reachable |
| Export progress | Browser download has no percentage | UI shows only “Preparing workbook…” |
| Browser text-only zoom not formally tested | Uncertainty at 200% text zoom | Responsive 360–2560 px tested; listed as next step |

## 5. Regression findings

No functional regression was found in the tested paths.

The only observed issues during verification were fixed:

- Period selector panel initially opened beneath the sticky header because of the header stacking context. It is now portaled to `body` with clamp-based positioning.
- Review table’s absolutely positioned `sr-only` action header extended the document width. The table scroll container is now positioned and `Card` has `min-width: 0`.
- The first programmer run of the draw-capture script tried to serialize a DOM element as a CDP return value; the probe was corrected. This was test tooling, not application code.
- A stale sign-out toast persisted after re-login; the login flow now clears the previous notice.
- Nav badge accessible text lacked pluralization/spacing; corrected.

## 6. Backend dependencies not changed

- Workbook templates in `backend/templates/` (bundled) or the authoritative backend `templates/`.
- MongoDB `Profile`, `ReportingPeriod`, `DailyRecord`, and `User` models.
- Zod schemas, calculation rules, and JWT/session behavior.
- Render/Vercel proxy configuration.

If any of these change later, re-run `TEST_RESULTS.md` scenarios before claiming compatibility.
