# Test results

**Execution date:** October 27, 2026  
**Environment:** Windows, Node 25.6.0, Chromium (installed Chrome), MongoDB 7 in a disposable Docker container, authoritative backend at `C:\Projects\NodeJs\DTR\DTR-Backend`.

No test is marked passed unless it was executed. Items that were not run are listed separately.

## 1. Commands executed

| Command | Result |
| --- | --- |
| `npm run check` (frontend) | **Passed** — TypeScript strict check |
| `npm run check` (root) | **Passed** — backend syntax checks + frontend TypeScript |
| `npm test` (frontend) | **Passed** — 8 test files, 44 tests |
| `npm test` (root) | **Passed** — 16 backend tests + 44 frontend tests |
| `npm test` (authoritative backend) | **Passed** — 16 tests |
| `npm run build` (frontend) | **Passed** |

## 2. Build output

Final production build:

- 2084 modules transformed.
- Initial JS: `index-C-H4tr3Z.js` — 454.32 kB (138.50 kB gzip).
- Lazy route chunks: `DailyEntryView` 13.83 kB, `ReviewView` 8.89 kB, `SettingsView` 7.52 kB, `LeaveView` 7.49 kB, `ExportsView` 6.67 kB, shared `validation` 6.22 kB, plus small icon chunks.
- CSS: 50.90 kB (10.00 kB gzip).
- Inter variable font files split by unicode range; Latin normal 48.25 kB.
- `index.html` 0.51 kB.

Baseline build before the redesign was 88 modules, 268.32 kB JS (80.58 kB gzip), 29.52 kB CSS. The increase reflects React Router, the icon set, the local Inter font, the new component system, and the testable domain layer. Route-level lazy loading keeps the initial route bundle at 454 kB instead of ~498 kB.

## 3. Frontend tests

```
Test Files  8 passed (8)
Tests       44 passed (44)
```

Coverage by file:

| Test file | Tests |
| --- | --- |
| `domain/date.test.ts` | 8 |
| `domain/records.test.ts` | 5 |
| `domain/period.test.ts` | 6 |
| `domain/daily.test.ts` + validation | 10 |
| `views/LoginView.test.tsx` | 4 |
| `views/DashboardView.test.tsx` | 4 |
| `views/ReviewView.test.tsx` | 4 |
| `components/PeriodSelector.test.tsx` | 3 |

## 4. Backend regression

Both the bundled backend and the authoritative backend passed 16/16 tests:

- Workday, rest-day, holiday, overnight, override, leave/absent, and missing-time calculations.
- Preview authentication and validation.
- Period range hydration and legacy embedded record fallback.
- Semi-monthly range selection.
- Holiday and accomplishment workbook behavior.

No backend source or test was modified.

## 5. Real backend API integration

Disposable setup:

- MongoDB 7 container `dtr-ui-test-mongo`, port 27018.
- Authoritative backend on port 3000.
- Database `dtr_ui_test`, seeded admin `demo` with test-only password.
- Container removed after testing; no developer/production database was used.

Executed PowerShell HTTP flow:

| Step | Result |
| --- | --- |
| `POST /api/auth/login` | 200, user `demo` |
| `GET /api/auth/session` | 200, user `demo` |
| `PUT /api/profile` | 200, `Demo Employee` persisted |
| `POST /api/daily-hours/preview` | 480 regular minutes, 0 overtime for 09:00–18:00 with 60-minute break |
| `PUT /api/periods/:id/days?date=10/27/2026` | 200, saved record id returned, 480 regular minutes |
| `GET /api/periods/current` | 1 record hydrated |
| `PUT /api/periods/:id/leave` | 200, request hydrated on the period |
| `GET /export/dtr` | 179,609-byte XLSX, ZIP signature `PK` |
| `GET /export/accomplishments` | 7,358-byte XLSX, ZIP signature `PK` |
| `POST /api/auth/logout` | 204 |
| `GET /api/auth/session` after logout | 401 |

Frontend against the same real backend (Vite dev server at 5173, proxied to 3000):

- Login and session restoration.
- Dashboard: `1 of 16 dates entered`, 8.00 regular hours, 0.00 overtime, next missing date October 16.
- Daily Entry October 27: saved values loaded, preview updated to 8.00 regular + 1.00 overtime after changing the start time, save returned a success toast, Save disabled when unchanged.
- Leave: saved request loaded; switching to October 1–15 produced a blank “New request” with “Saved request: No”; switching back restored the saved request.
- Settings: project assignment edit saved and re-rendered as “Saved”.
- Exports: real DTR workbook request initiated; Chrome created a ~179 kB download.

## 6. Accessibility results

axe-core 4.14, WCAG A/AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`).

| Audit | Result |
| --- | --- |
| 1440 px: all six authenticated screens | **0 violations** |
| 390 px: Dashboard, Daily Entry, Review, Leave, Exports | **0 violations** |
| 360 px: all six authenticated screens | **0 violations** |
| 768 px: all six authenticated screens | **0 violations** |
| 1024 px: all six authenticated screens | **0 violations** |
| 1920 px: all six authenticated screens | **0 violations** |

Manual keyboard smoke test:

- First Tab focused the skip link with a visible 2 px outline.
- Subsequent Tab order: sidebar links → account menu → period selector → page actions → date tiles.
- Focus rings rendered as expected (computed box shadows on ring-based controls).
- Escape closed the account menu and returned focus to its trigger.
- Escape closed the period panel and returned focus to its trigger.
- Escape closed the mobile navigation drawer.
- DOM inspection confirmed every tested input/textarea/select has an associated `<label>`.

## 7. Runtime console

A fresh production-build load was exercised across Login and all six authenticated routes while collecting console errors, warnings, and uncaught exceptions.

- Only the expected `401 Unauthorized` from the pre-login session probe appeared.
- No React runtime warnings, uncaught exceptions, or route-level console errors appeared in the production build.
- The TanStack Query devtools control was absent from the production build.

## 8. Responsive results

Probe at 360, 390, 768, 1024, 1280, 1440, 1920, and 2560 px across all six authenticated routes:

- `document.documentElement.scrollWidth === window.innerWidth` in every case.
- No unintended horizontal page overflow.
- Review table overflows only inside its own scroll container.
- Decorative hero circles are clipped inside their cards.
- No axe violations in the audited responsive combinations.

## 9. Screenshots

Final captures are in `docs/ui-ux/screenshots/`:

- `login-desktop.jpg`
- `dashboard-desktop.jpg`
- `daily-entry-desktop.jpg`
- `period-review-desktop.jpg`
- `leave-desktop.jpg`
- `settings-desktop.jpg`
- `exports-desktop.jpg`
- `dashboard-mobile.jpg`
- `daily-entry-mobile.jpg`
- `mobile-navigation.jpg`

## 10. Not executed

The following were not performed and are not claimed:

- Playwright or Cypress end-to-end suite.
- Automated visual-regression baselines.
- Manual screen-reader pass (NVDA/JAWS/VoiceOver).
- Windows forced-colors/high-contrast validation.
- Browser text-only zoom at 200% (responsive widths were tested instead).
- Cross-browser matrix beyond Chromium/Edge-based Chrome.
- Production load/performance profiling.
- Multi-user stress testing of the shared profile.

## 11. Environment cleanup

- Disposable `dtr-ui-test-mongo` container removed.
- Backend and Vite dev processes stopped.
- Fixture server stopped after screenshot capture.
- No other developer containers, images, or volumes were removed.
- No production or developer database was used.
