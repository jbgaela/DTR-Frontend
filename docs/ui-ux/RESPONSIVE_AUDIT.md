# Responsive audit

## Method

The production build was rendered in headless Chrome at each target width. For every authenticated route (`/dashboard`, `/daily`, `/review`, `/leave`, `/settings`, `/exports`) the probe checked:

- `document.documentElement.scrollWidth` versus `window.innerWidth`
- elements outside the viewport with visible overflow (excluding fixed elements and scroll containers)
- axe-core WCAG A/AA rules at 360, 768, 1024, and 1920 px

The same build was also reviewed manually at desktop and mobile sizes through the OpenChamber browser panel.

## Width matrix

| Width | Target | Result |
| --- | --- | --- |
| 360 px | Small mobile | No page overflow; no axe violations |
| 390 px | Common mobile | No page overflow; no axe violations |
| 768 px | Tablet | No page overflow; Review table scrolls inside its card |
| 1024 px | Small laptop | No page overflow; sidebar appears |
| 1280 px | Desktop | No page overflow |
| 1440 px | Standard desktop | No page overflow; no axe violations |
| 1920 px | Large desktop | No page overflow; no axe violations |
| 2560 px | Wide desktop | No page overflow; content capped at 1440 px |

The only “overflowing” descendants reported were:

- decorative, clipped circles inside the hero cards,
- the Review table inside its own `overflow-x-auto` card.

In both cases the document scroll width remained equal to the viewport width.

## Layout behavior

### Desktop

- Fixed 264 px sidebar; 1440 px content cap.
- Sticky 64 px top bar with period selector and timezone chip.
- Dashboard uses a two-column progress/next-action row above four metrics and a 6-column date grid.
- Daily Entry uses a main form column plus a 390 px sticky calculation/action column.
- Settings uses two-column card groups and a sticky save bar.
- Exports uses two workbook cards.
- Review uses a wide table with internal horizontal scroll below its card width.

### Tablet (`768–1023 px`)

- Sidebar hidden; top bar keeps the compact period selector and account menu.
- Bottom navigation visible.
- Dashboard metrics become two columns; the completion and next-action panels stack.
- Daily Entry stacks the calculation/action cards below the form.
- Review switches to full-width desktop table with internal scroll at 768 px.
- Settings and Leave stack side panels below the main form.

### Mobile (`<640 px`)

- Top bar: menu, period range, avatar.
- Bottom navigation: Home, Entry, Review, Leave, More; badges for attention count.
- Page headers stack actions below the title.
- All form fields become single-column.
- Date inputs and time inputs remain native and touch-sized.
- Dashboard metrics and date tiles use two columns.
- Review uses cards instead of a compressed table.
- The period panel and account menu are constrained to the viewport width.
- The drawer is 86vw maximum and scrolls independently.

## Specific safeguards

- No unintended horizontal page scroll at any tested width.
- Review table has a `relative overflow-x-auto` wrapper so absolutely positioned `sr-only` content is contained.
- `Card` has `min-w-0` to prevent table content from expanding grid/page width.
- Period panel is portaled to `body`, positioned from the trigger rect, and clamped inside the viewport; it has a viewport-relative max height.
- Mobile main content uses bottom padding so the fixed navigation does not make the final controls unreachable.
- Sticky Settings actions sit above the mobile bottom navigation (`bottom-[4.5rem]`, `lg:bottom-4`).
- Long labels and date ranges truncate only where a full accessible name is still provided.

## Manual checks

- Mobile login fits without scrolling.
- Mobile drawer traps focus and closes via Escape/close button.
- Period panel remains usable at 360 px.
- Date tiles remain readable at two columns.
- Save entry and Delete entry remain reachable on mobile.
- Dashboard and Daily Entry were also exercised against the real backend at tablet width.

## Outstanding responsive limitations

- The desktop period selector can be visually dense at exactly 1024 px with a long custom range label; it truncates rather than overlapping.
- The Review desktop table intentionally scrolls horizontally at small laptop/tablet widths rather than hiding hour categories.
- No automated visual baseline comparison is configured; screenshots are captured in `screenshots/`.
