# Accessibility audit

## Target

WCAG 2.2 AA for the redesigned authenticated application and login screen, with keyboard, focus, contrast, error, and motion requirements treated as functional requirements.

## Automated results

Tool: **axe-core 4.14** injected through a temporary Chrome DevTools harness (not shipped to users). Rules: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.

| Width | Routes audited | Violations |
| --- | --- | --- |
| 1440 px | Dashboard, Daily Entry, Period Review, Leave, Settings, Exports | 0 |
| 390 px | Dashboard, Daily Entry, Period Review, Leave, Exports | 0 |
| 360, 768, 1024, 1920 px | All authenticated routes, spot audit | 0 |

The final runs were made after the last visual and accessibility changes. Results are recorded in `TEST_RESULTS.md`.

## Keyboard and focus

- Skip link at the start of the shell targets `#main-content`.
- Route changes set `document.title` and announce the route label through a polite live region.
- Every interactive control has a visible `:focus-visible` ring (2 px brand outline, plus component ring utilities).
- Sidebar and mobile navigation use real links; `aria-current` is supplied by React Router.
- The mobile drawer and confirmation dialogs use Radix Dialog focus trapping, Escape dismissal, and labelled titles/descriptions.
- Account menus and the period panel support Escape and outside-click dismissal; account menus focus the first menu item.
- Destructive actions cannot be triggered accidentally through a reusable “clear” label.
- The unsaved-changes blocker can be cancelled and returns the user to the page.

## Form accessibility

- Every field uses an associated `<label>`; helpers and errors are linked with `aria-describedby`.
- Invalid fields set `aria-invalid` and display an inline error with `role="alert"`.
- Validation moves focus to the first invalid field.
- Required fields are marked visually and with `aria-required`.
- Password visibility is a toggle button with `aria-pressed` and a changing accessible label.
- The login form preserves entered values after recoverable errors.
- Date inputs use native controls and the period bounds constrain the daily date picker.
- Task textarea explains one-task-per-line behavior and remaining limits.

## Color and contrast

Key token ratios (normal text):

| Pair | Ratio |
| --- | --- |
| Ink `#15233b` on surface `#ffffff` | 15.73 |
| Muted `#5c6b80` on surface | 5.06 |
| Muted on canvas `#f5f7fb` | 5.14 |
| White on brand `#2563d9` | 5.43 |
| White on brand-strong `#1d4fb8` | 7.34 |
| Success `#067a61` on success-soft | 4.83 |
| Warning `#a85d0a` on warning-soft | 4.59 |
| Danger `#c03434` on danger-soft | 5.00 |
| Sidebar text `#a9b7ca` on sidebar `#0c1b32` | 8.46 |

The baseline muted color was darkened from `#64748b` after contrast measurement; the success token was darkened from `#087f66`. The active filter count uses a dark translucent badge rather than white/20. White-on-brand text in the next-action card uses at least `text-white/90`.

## Status communication

- Saved/missing/upcoming states combine text and icon, not color alone.
- Active navigation has a background plus an indicator bar.
- Progress is expressed as a percentage and an absolute count (`11 of 16`).
- Future-only periods are labelled “Upcoming”, not completed or overdue.
- Toasts and persistent alerts use appropriate status/alert roles.
- The download UI does not fabricate percentage progress.

## Motion

- Transitions are short (150–220 ms) and do not delay interaction.
- `prefers-reduced-motion: reduce` disables animation/transition durations and smooth scrolling.
- Loading spinners include `motion-reduce:animate-none`.

## Verified manually

- Keyboard tab order on the dashboard: skip link → sidebar navigation → account menu → period selector → page actions → date tiles. Focus rings were present via the component ring styles (verified as computed box shadows).
- Account menu: Escape closed the menu and returned focus to the trigger.
- Period selector: Escape closed the panel and returned focus to the trigger.
- Mobile drawer: Escape closed the drawer.
- Screen-reader label association verified through the DOM (`input.labels`); a browser snapshot heuristic that reported missing names was confirmed to be a tool limitation, not a missing label.
- Mobile touch target review: primary controls are at least 40 px high; navigation rows are at least 40–44 px.

## Not yet verified

- A full manual screen-reader pass with NVDA/JAWS/VoiceOver.
- Windows High Contrast / forced-colors mode.
- Browser text-only zoom at 200% (page-level responsive checks covered 360–2560 px).
- Automated visual regression and axe checks in CI.
- User testing with assistive-technology users.

These are listed in `FINAL_HANDOFF.md` as next steps.
