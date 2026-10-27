# Test plan

## 1. Objectives

Verify that the redesign:

1. preserves authentication, period loading, daily save/delete, profile, leave, and export behavior;
2. keeps server-calculated hours authoritative;
3. handles loading, empty, error, validation, disabled, and unsaved states;
4. works across the target viewport matrix;
5. is keyboard operable and free of automated WCAG A/AA violations;
6. does not change backend API contracts or workbook templates.

## 2. Tools

| Layer | Tool |
| --- | --- |
| Type check | TypeScript `tsc --noEmit` |
| Production build | Vite 8 |
| Unit/component tests | Vitest 4, jsdom, Testing Library, user-event, jest-dom |
| Backend unit tests | Node `node --test` (existing suite) |
| Accessibility | axe-core 4.14 via a temporary Chrome DevTools probe, WCAG A/AA tags |
| Responsive | Chrome DevTools device metrics at 360, 390, 768, 1024, 1280, 1440, 1920, 2560 px |
| Browser smoke | OpenChamber browser panel + synthetic fixture server |
| API integration | Disposable MongoDB container + authoritative backend, PowerShell HTTP client |
| Excel verification | File size and ZIP (`PK`) signature check on downloaded workbooks |

## 3. Commands

```powershell
# from C:\Projects\React\DTR
npm run check
npm test
npm run build

# from C:\Projects\React\DTR\frontend
npm run test
npm run test:watch
```

The root `npm run check` covers backend syntax checks plus frontend TypeScript. The root `npm test` runs the backend `node --test` suite and the frontend Vitest suite.

## 4. Unit test scope

- Date parsing, display/ISO conversion, leap years, invalid dates.
- Profile-timezone “today”.
- Current, previous, and next semi-monthly ranges across month/year boundaries.
- Date ranges, period labels, standard/custom cutoff detection.
- Blank records, weekend defaults, date lookup.
- Exact hour totals with separate regular, overtime, night, night OT, rest-day, rest-day OT, and holiday buckets.
- Saved/missing/today/upcoming classification.
- Rest day with zero hours counts as complete.
- Next-action priority and future dates not treated as overdue.
- Daily form round trip, task trimming, override-only-in-manual-mode, dirty signature.
- Daily/leave/profile validation limits and messages.

## 5. Component test scope

- Login: valid submission, trimmed username, empty-field error, server error with preserved values, password visibility, disabled/loading state.
- Dashboard: progress math, category display, primary action target, date-tile navigation, complete state, future-only state.
- Period Review: summary, filters, edit navigation, empty state, authoritative category columns.
- Period Selector: shortcut range application, invalid custom range, server error persistence, panel close on success.

## 6. Integration and end-to-end scope

### Synthetic fixture

The handoff fixture serves the production build and a deterministic synthetic API. It verifies:

- Login/session/logout.
- Dashboard rendering with 11 saved records and one missing date.
- Daily preview, save, saved state, and date navigation.
- Period switches and leave draft replacement.
- Settings validation/dirty state.
- Review filters and edit navigation.
- Exports error handling (fixture has no workbook route).
- Unsaved-change confirmation on period change and navigation.

### Real backend

A disposable MongoDB container (`dtr-ui-test-mongo`, port 27018, removed after the test) and the authoritative backend (`C:\Projects\NodeJs\DTR\DTR-Backend`, port 3000) were used to verify:

- Seed admin login and session cookie.
- Profile read/update.
- Current-period retrieval.
- Preview: 09:00–18:00 with 60-minute break → 480 regular minutes, 0 overtime.
- Save: authoritative record returned with 480 regular minutes.
- Leave save and current-period hydration.
- DTR and accomplishments exports: non-empty XLSX files with `PK` signatures.
- Logout: `204`; subsequent session request: `401`.
- Frontend against the real backend: login, dashboard counts, daily saved values, preview update, save toast, leave period switch, settings save, and real workbook download initiation.

## 7. Accessibility checks

- axe-core WCAG A/AA audit at 1440 and 390 px for all screens.
- Spot audits at 360, 768, 1024, and 1920 px.
- Keyboard tab order smoke test.
- Escape dismissal of account menu, period panel, and mobile drawer.
- DOM label association verification.
- Contrast calculation for all semantic token pairs.
- Reduced-motion CSS review.

## 8. Responsive checks

- No horizontal document overflow at any target width.
- Review table scrolls inside its card.
- Forms stack below 640 px.
- Bottom navigation does not make final controls unreachable.
- Period panel and account menu stay inside the viewport.
- Drawer remains usable at 390 px.

## 9. Exit criteria

| Gate | Requirement |
| --- | --- |
| Types | `tsc --noEmit` passes |
| Build | Production build passes |
| Unit/component tests | All tests pass |
| Backend regression | Existing backend suite passes |
| Accessibility | No critical/serious axe violations in audited routes |
| Responsive | No horizontal page overflow at target widths |
| API compatibility | No endpoint or payload contract changes |
| Exports | Both backend workbooks are valid non-empty XLSX files |
| Documentation | Handoff artifacts reflect actual implementation and results |

## 10. Out of scope

- Load/performance benchmarking under production traffic.
- Visual diff approval automation.
- Cross-browser matrix beyond Chromium (manual Chromium/Edge-based checks).
- Screen-reader and forced-colors certification.
- Backend data-model or calculation changes.
