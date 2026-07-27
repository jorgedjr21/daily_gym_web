# Daily Gym WEB


## GitHub Project

- Owner: jorgedjr21
- Project number: 1
- Repositório: jorgedjr21/daily_gym_web

## Tech Stack

- **Framework**: Vue 3 with `<script setup>` and Composition API
- **Language**: TypeScript (strict mode — `any` is an ESLint error)
- **UI components**: Custom components built on top of Radix Vue primitives
- **Styling**: Tailwind CSS 3 with CSS custom properties for theming; dark mode via `class` strategy
- **State management**: Pinia 3
- **Routing**: Vue Router 4
- **HTTP client**: Axios
- **Form handling**: VeeValidate + Zod schema validation
- **Data fetching**: TanStack Vue Query 5
- **Icons**: Lucide Vue Next
- **Utility**: `clsx` + `tailwind-merge` exposed as `cn()` in `src/lib/utils.ts`
- **Testing**: Vitest 3, Vue Testing Library 8, `@vue/test-utils` 2, jsdom
- **Build**: Vite 8
- **Node requirement**: >= 22.0.0

## Project Structure

```
src/
  components/
    ui/             # Primitive UI components (Button, Card, CardHeader, CardContent, Input)
    ui/__tests__/   # Unit tests co-located with components
  lib/
    utils.ts        # cn() helper (clsx + tailwind-merge)
  test/
    setup.ts        # Vitest global setup — imports @testing-library/jest-dom
  App.vue           # Root component
  main.ts           # App entry point
  style.css         # Global CSS (Tailwind base + CSS custom properties)
```

As the project grows, add these directories under `src/`:
- `pages/` — one component per route
- `stores/` — Pinia stores
- `composables/` — reusable `use*` functions
- `services/` — Axios HTTP layer
- `types/` — shared TypeScript interfaces

## Dev Workflow (Docker-based via Makefile)

All commands run inside a `node:22-alpine` container. Never run npm directly on the host unless you have Node 22+ installed.

| Task | Command |
|---|---|
| Start dev server (port 5173) | `make dev` |
| Install dependencies | `make install` |
| Run tests (single pass) | `make test` |
| Run tests in watch mode | `make test-watch` |
| Production build | `make build` |
| Type check | `make type-check` |
| Lint | `make lint` |
| Format (Prettier) | `make format` |

`make dev` uses `docker compose up` — the compose file mounts source files and exposes port 5173.

## Component Conventions

- All components use `<script setup lang="ts">` — the ESLint rule `vue/block-lang` enforces this.
- Props are always typed with a TypeScript `interface` passed to `defineProps<Props>()`.
- Class merging uses the `cn()` utility from `@/lib/utils`.
- UI primitives live in `src/components/ui/` and are named in PascalCase (e.g., `Button.vue`, `CardHeader.vue`).
- When adding a new UI primitive, create its test file at `src/components/ui/__tests__/<ComponentName>.spec.ts`.
- Variants and sizes are implemented as plain `Record<..., string>` maps resolved at render time (no `class-variance-authority` at runtime — CVA is a dependency but the current components use manual maps).

## Testing Conventions

- Test runner: Vitest with `globals: true` and `environment: jsdom`.
- Setup file: `src/test/setup.ts` — runs before every test file and imports `@testing-library/jest-dom` matchers.
- Coverage provider: v8 (`make test` → `npm run test`, `npm run test:coverage` for lcov report).
- Test files live next to the code they test inside a `__tests__/` directory.
- Prefer `@vue/test-utils` `mount()` for component unit tests; use `@testing-library/vue` `render()` + `screen` queries for user-facing behaviour tests.
- Never merge with failing tests (`vitest run` must exit 0).
- `vitest.config.ts` excludes the `e2e/` directory so unit and e2e runs never collide.

## End-to-End Testing (Playwright)

- E2E specs live in `e2e/` (kept separate from Vitest's `src/**/__tests__` unit tests).
- `npm run test:e2e` builds the app and runs the suite against `vite preview` (`playwright.config.ts` starts/stops the preview server automatically via `webServer`).
- `npm run test:e2e:ui` opens the Playwright UI runner for local debugging (assumes the preview server is already reachable or built).
- Chromium only for now (`projects` in `playwright.config.ts`), to keep CI fast.
- CI job `e2e` in `.github/workflows/ci.yml` caches the downloaded Chromium browser under `~/.cache/ms-playwright` and uploads the HTML report as an artifact on every run.

## Key Config Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build config; sets `@` alias to `./src` |
| `vitest.config.ts` | Vitest config; jsdom env, globals, setup file, v8 coverage, excludes `e2e/` |
| `playwright.config.ts` | Playwright config; chromium-only project, `baseURL` pointing at `vite preview` (port 4173), auto-managed `webServer` |
| `tailwind.config.ts` | Tailwind theme extending with CSS var-based design tokens; dark mode via `class` |
| `tsconfig.app.json` | Strict TypeScript config for `src/`; `@/*` path alias |
| `eslint.config.js` | Flat ESLint config; `no-explicit-any` and `no-unused-vars` are errors |
| `docker-compose.yml` | Dev container — node:22-alpine, port 5173, named volume for node_modules |
| `Makefile` | Wraps all npm scripts in Docker `node:22-alpine` one-shot containers |