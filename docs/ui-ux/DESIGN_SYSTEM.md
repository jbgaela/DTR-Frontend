# Design system

The design system is implemented with Tailwind CSS 4 theme tokens in `src/styles.css` and shared React components in `src/components/ui.tsx`. Every authenticated screen uses the same shell, surfaces, controls, typography scale, states, and focus treatment.

## 1. Design principles

- **Minimal:** neutral surfaces, restrained color, useful dividers, no decorative gradients behind content.
- **Consistent:** one button system, one field system, one card radius, one focus ring, one loading vocabulary.
- **Clear:** page title → description → actions → content; numeric categories stay labelled and separated.
- **Efficient:** URL-addressable screens, global period control, direct date tiles, next-action cards, compact filters.
- **Accessible:** semantic headings, visible focus, labelled fields, error announcement, reduced-motion support, keyboard-operable dialogs.
- **Responsive:** desktop sidebar, mobile drawer + bottom navigation, fluid grids, internally scrolling tables.

## 2. Color tokens

Tokens are declared in `src/styles.css` under `@theme` and exposed as Tailwind utilities (`bg-canvas`, `text-ink`, `border-line`, etc.).

| Token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#f5f7fb` | App background |
| `--color-surface` | `#ffffff` | Cards, controls, popovers |
| `--color-ink` | `#15233b` | Primary text |
| `--color-muted` | `#5c6b80` | Secondary text, helpers |
| `--color-line` | `#e3e9f2` | Borders and dividers |
| `--color-brand` | `#2563d9` | Primary action, active navigation |
| `--color-brand-strong` | `#1d4fb8` | Action hover / gradient end |
| `--color-brand-soft` | `#edf3ff` | Informational tint, selected surfaces |
| `--color-success` | `#067a61` | Saved, complete, positive status |
| `--color-warning` | `#a85d0a` | Missing, caution, override |
| `--color-danger` | `#c03434` | Destructive actions and failures |
| `--color-sidebar` | `#0c1b32` | Desktop sidebar and login brand panel |
| `--color-sidebar-text` | `#a9b7ca` | Sidebar secondary text |

Contrast was checked for normal text. Important pairs:

| Pair | Ratio |
| --- | --- |
| Ink on white | 15.73 |
| Muted on white | 5.06 |
| Muted on canvas | 5.14 |
| White on brand | 5.43 |
| Success on success-soft | 4.83 |
| Warning on warning-soft | 4.59 |
| Danger on danger-soft | 5.00 |
| Sidebar text on sidebar | 8.46 |

## 3. Typography

- Typeface: **Inter Variable**, loaded locally through `@fontsource-variable/inter`.
- Fallback: `Inter, ui-sans-serif, system-ui, sans-serif`.
- Page title: 26–30 px semibold, tight tracking.
- Card/section title: 15 px semibold.
- Body: 14 px / 1.5.
- Field label: 13 px semibold.
- Helper/caption: 11–12 px.
- KPI values: 28 px semibold with tabular figures.
- Numeric table cells and totals use `.tabular` (`font-variant-numeric: tabular-nums`).

No more than one H1 per screen. Page headings come from `PageHeader`; card headings are H2 (H3 available in `CardHeader`).

## 4. Spacing and sizing

A 4 px scale is used with these recurring values:

| Value | Role |
| --- | --- |
| 4 px | Tight icon/text relationship |
| 8 px | Icon + label, compact groups |
| 12 px | Helper text, small gaps |
| 16 px | Standard control spacing |
| 24 px | Card padding / section separation |
| 32 px | Major groups |
| 40–48 px | Page sections |

Common controls:

- Inputs/selects/textareas: 40–42 px minimum height, 8 px radius.
- Buttons: 36 px (small), 40 px (medium), 44 px (large); 8 px radius.
- Cards: 16 px radius, 1 px neutral border, subtle two-layer shadow.
- Popovers/dialogs: 16 px radius, stronger shadow.
- Desktop content max width: 1440 px; page gutters 16/24/32 px.

## 5. Surfaces and hierarchy

- **Canvas** is the page background.
- **Surface** cards hold forms, tables, metrics, and summaries.
- Tinted surfaces are used only to communicate state:
  - brand-soft for informational context,
  - success-soft for saved/complete,
  - warning-soft for missing/override,
  - danger-soft for destructive/failure.
- Elevation is minimal: border + `.surface-shadow`; popovers/dialogs use `.popover-shadow`.
- Dividers (`border-line`) replace nested borders wherever possible.

## 6. Shared components

| Component | Variants / states |
| --- | --- |
| `Button` | primary, secondary, ghost, danger, danger-soft; sm/md/lg; loading; disabled |
| `IconButton` | ghost/secondary; accessible label; loading; disabled |
| `Card` / `CardHeader` | surface, optional action and description |
| `PageHeader` | eyebrow, title, description, action slot |
| `Badge` | neutral, info, brand, success, warning, danger |
| `MetricCard` | label, value, unit, hint, icon, tone |
| `ProgressBar` | brand/success/warning tones, ARIA progressbar |
| `ProgressRing` | completion ring with accessible label |
| `TextField`, `SelectField`, `TextareaField` | label, hint, error, required, disabled |
| `CheckboxField` | label + helper text |
| `InlineAlert` | info/success/warning/danger, optional action and dismiss |
| `EmptyState` | icon, title, description, action |
| `Skeleton` / `PageSkeleton` | loading placeholders |
| `Avatar` | initials, decorative or accessible |
| `Toast` | success/error/info, live region |
| `ConfirmDialog` | Radix dialog, danger/primary, busy state |
| `PeriodSelector` | shortcut ranges, custom ISO date range, server error |
| `UserMenu` | account menu, keyboard and outside-click dismissal |
| `Sidebar` / `MobileNavigation` | active state with indicator, badge, focus ring |

## 7. Interaction states

- **Hover:** surface or border change, never movement that shifts layout.
- **Focus:** 2 px brand ring; `:focus-visible` globally, plus component ring utilities.
- **Disabled:** muted surface and reduced opacity; no pointer cursor.
- **Loading:** spinner + explicit verb (“Saving entry…”, “Preparing workbook…”); button disabled while pending.
- **Errors:** field-level text with `aria-invalid` and `aria-describedby`; page-level alert for server failures.
- **Success:** toast plus an in-context badge/state where persistence changed.

## 8. Motion

- 150–220 ms transitions for hover/focus/enter.
- One short entry animation for popovers, dialogs, toasts, and the mobile drawer.
- No looping or attention-seeking animation.
- `@media (prefers-reduced-motion: reduce)` disables transitions/animations and smooth scrolling.

## 9. Responsive rules

- `< 640 px`: single-column fields, compact top bar, bottom navigation, drawer for secondary items.
- `640–1023 px`: two-column form grids where space allows, compact top bar; no permanent sidebar.
- `≥ 1024 px`: 264 px fixed sidebar, full top bar, two-column content where useful.
- Wide screens: content stops at 1440 px; cards do not stretch into unreadable lines.
- Review tables scroll inside their card; the page itself does not overflow horizontally.

## 10. Accessibility standards

- Skip link at the start of the authenticated shell.
- Route label announced through a polite live region.
- Active navigation uses background + left/top indicator, not color alone.
- Status chips combine icon + text.
- Date tiles expose full date and entry state, plus “Open daily entry”.
- Dialog focus trap and Escape behavior come from Radix.
- Account menus and the period panel close on Escape and outside click.
- Destructive actions require confirmation.
- Unsaved changes are protected on route, date, period, tab close, and logout.
- Inputs are labelled and errors are linked; no placeholder-only fields.
