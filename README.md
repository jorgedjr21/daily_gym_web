# Daily Gym Web

Frontend SPA for the Daily Gym workout tracker, built with Vue 3, TypeScript, and Tailwind CSS.

## Stack

- **Vue 3** with `<script setup>` and Composition API
- **TypeScript** in strict mode
- **Vite** as build tool
- **Tailwind CSS** for styling
- **shadcn-vue** component library (Button, Input, Card)
- **Pinia** for client state management
- **TanStack Vue Query** for server state
- **Vue Router 4** for routing
- **Vee-Validate + Zod** for form validation
- **Vitest + @vue/test-utils** for unit/component tests

## Requirements

- Docker and Docker Compose

## Setup

```bash
cp .env.example .env
make install
```

## Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `make dev`        | Start dev server at http://localhost:5173 |
| `make test`       | Run unit tests                           |
| `make test-watch` | Run tests in watch mode                  |
| `make build`      | Build for production                     |
| `make type-check` | Run TypeScript type checking             |
| `make lint`       | Run ESLint                               |
| `make format`     | Format code with Prettier                |

## Environment Variables

See `.env.example` for all required variables.

| Variable       | Description              |
|----------------|--------------------------|
| `VITE_API_URL` | Base URL of the REST API |
