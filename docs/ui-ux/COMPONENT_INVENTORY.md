# Component inventory

## Application shell

| File | Responsibility |
| --- | --- |
| `src/main.tsx` | Mounts React Query and a data router; imports Inter; production/dev bootstrap |
| `src/App.tsx` | Session gates, URL-aware shell, sidebar/top bar/mobile navigation, route table, lazy loading, unsaved navigation blocker, confirmations, toast |
| `src/components/Sidebar.tsx` | Desktop navigation, active indicator, attention count, account footer |
| `src/components/MobileNavigation.tsx` | Bottom navigation and Radix dialog drawer |
| `src/components/PeriodSelector.tsx` | Global reporting-period trigger, shortcuts, custom range, portal popover, loading/error |
| `src/components/UserMenu.tsx` | Keyboard-accessible account menu with Settings/sign out |
| `src/components/Toast.tsx` | Single live-region notification |
| `src/components/ConfirmDialog.tsx` | Accessible Radix confirmation dialog with busy state |
| `src/components/ErrorState.tsx` | Full-page fatal error with retry |
| `src/components/LoadingState.tsx` | Startup loading state |
| `src/components/unsaved.tsx` | Unsaved guard context and `usePageDirty` registration |

## Primitives

`src/components/ui.tsx` exports:

- `cn` class combiner
- `Button`, `IconButton`
- `Card`, `CardHeader`, `PageHeader`
- `Badge`, `MetricCard`
- `ProgressBar`, `ProgressRing`
- `EmptyState`, `Skeleton`, `PageSkeleton`
- `InlineAlert`
- `TextField`, `SelectField`, `TextareaField`, `CheckboxField`
- `Avatar`

All form controls share the same border, surface, focus, disabled, hint, and error treatment. All colors come from theme tokens.

## Domain and state

| File | Responsibility |
| --- | --- |
| `src/api.ts` | Typed contracts, credentialed fetch, error envelope, 401 hook, export blob download, time conversion |
| `src/query.ts` | QueryClient defaults and stable keys |
| `src/hooks/useDtrApp.ts` | Session, backend-default range, URL range, cache reconciliation, mutations, toasts, logout, retry |
| `src/hooks/useDailyHoursPreview.ts` | 200 ms debounced preview, enabled rules, calculating/error/ready state |
| `src/domain/date.ts` | Display/ISO/UTC conversions, timezone “today”, cutoff ranges, labels, ranges |
| `src/domain/records.ts` | Blank records, date ranges, exact hour totals |
| `src/domain/period.ts` | Saved/missing/today/upcoming classification, completion, next action |
| `src/domain/daily.ts` | Form mapping, payload/preview builders, dirty signature, override labels |
| `src/domain/validation.ts` | Daily, leave, and profile validation |
| `src/domain/format.ts` | Hours, clock, duration, initials, day/leave labels, pluralization |

## Screen components

| File | Key behaviors |
| --- | --- |
| `src/views/LoginView.tsx` | Brand panel, labelled credentials, password visibility, local/server errors, pending state |
| `src/views/DashboardView.tsx` | Greeting, completion ring, entered/missing/upcoming, next action, future-only state, four KPIs, date overview, recent entries, exact category summary |
| `src/views/DailyEntryView.tsx` | Date navigation, attendance, accomplishments, server preview, manual overrides, validation, save/reset/delete, unsaved guard |
| `src/views/ReviewView.tsx` | Summary metrics, filters, desktop table, mobile cards, exact categories, empty states |
| `src/views/LeaveView.tsx` | Period-aware draft sync, date/day/reason validation, saved summary, save/delete confirmation |
| `src/views/SettingsView.tsx` | Grouped employee/signoff/attendance/night settings, validation, dirty guard, shared-profile and inactive-setting notes |
| `src/views/ExportsView.tsx` | Two workbook cards, completeness warnings, required-name warning, fetch/blob download, error and loading states |

## Test files

| File | Scope |
| --- | --- |
| `src/domain/date.test.ts` | Parsing, leap years, ISO conversion, timezone today, cutoffs, labels, ranges |
| `src/domain/records.test.ts` | Blank records, weekend defaults, totals, exact buckets |
| `src/domain/period.test.ts` | Date states, rest-day completion, missing/upcoming, next action, sorting |
| `src/domain/daily.test.ts` | Form round trip, task trimming, override handling, validation |
| `src/views/LoginView.test.tsx` | Submission, trimming, errors, password toggle, pending state |
| `src/views/DashboardView.test.tsx` | Progress, metrics, date navigation, future-only and complete states |
| `src/views/ReviewView.test.tsx` | Exact categories, filters, edit navigation, empty state |
| `src/components/PeriodSelector.test.tsx` | Shortcuts, invalid range, server error, panel state |

## Removed or replaced

- Replaced the local-state view switch with React Router routes and URL query parameters.
- Replaced the single global header period form with the compact `PeriodSelector`.
- Replaced the old `Field` wrapper with explicit labelled field components.
- Replaced the old `secondary` button API with variant/size/loading primitives.
- Removed direct export anchors in favor of authenticated fetch/blob downloads with error handling.
- Removed ambiguous “Clear day” labeling.
