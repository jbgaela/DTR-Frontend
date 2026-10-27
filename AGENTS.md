# Repository Guidelines

## Project Structure & Module Organization

This repository is a React 19, TypeScript, and Vite frontend. Application code lives in `src/`:

- `views/` contains screen-level components such as `DashboardView.tsx`.
- `components/` contains reusable UI elements.
- `hooks/` owns application state and side effects.
- `domain/` contains pure date, record, progress, and validation logic.
- `constants/` stores shared user-facing messages.
- `test/` contains test setup and shared test helpers.
- `api.ts` defines API types and the credentialed `/api` client.
- `docs/ui-ux/` contains the UI/UX handoff, audits, and final screenshots.

`src/main.tsx` is the entry point, `App.tsx` coordinates routing and the application shell, and `styles.css` contains tokens and global styling. Production output is generated in `dist/`; do not edit or commit it. Deployment configuration is in `Dockerfile`, `nginx.conf`, and `vercel.json`.

## Build, Test, and Development Commands

- `npm install`: install the exact dependency tree from `package-lock.json`.
- `npm run dev`: start Vite locally; `/api` requests proxy to `http://localhost:3000`.
- `npm run check`: run strict TypeScript validation without emitting files.
- `npm run test`: run the Vitest suite once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run build`: create the production bundle in `dist/`.

Run `npm run check`, `npm run test`, and `npm run build` before opening a pull request. Backend tests live in the backend repository and run with `npm test` there (or the root `npm test`).

## Coding Style & Naming Conventions

Follow the existing TypeScript style: two-space indentation, double quotes, semicolons, ES modules, `const` by default, and concise arrow functions. Use `PascalCase` for components and exported types, `camelCase` for functions and variables, and the `useX` convention for hooks. Keep view-specific rendering in `views/`, shared controls in `components/`, and pure calculations in `domain/`. TypeScript is configured with `strict: true`; avoid `any` and validate API data at boundaries. No formatter or linter is currently configured, so match nearby code and avoid unrelated formatting churn.

## Testing Guidelines

Vitest, jsdom, Testing Library, and user-event are configured in `vitest.config.ts`; setup lives in `src/test/setup.ts`. No coverage threshold is enforced. Colocate tests as `*.test.ts` or `*.test.tsx` beside the module they cover. Prefer pure `domain/` tests for date, record, progress, and validation logic; use Testing Library for user-visible component behavior. For every change, run the type check, test suite, and production build, then manually exercise affected success, loading, empty, validation, and error states through `npm run dev`. Do not claim verification that was not executed; record real results in `docs/ui-ux/TEST_RESULTS.md` when changing the UI/UX baseline.

## Commit & Pull Request Guidelines

History currently uses short, imperative summaries such as `Feature: Initial Commit`; keep subjects focused and under roughly 72 characters. Pull requests should explain the user-visible outcome, note verification performed, and link the relevant issue. Include before/after screenshots for UI changes and call out API contract, configuration, or deployment impacts.

## Security & Configuration

Never commit credentials or `.env` files. Preserve credentialed API requests and the same-origin `/api` proxy. Keep environment-specific values outside source code, and avoid logging authentication data or employee details.
