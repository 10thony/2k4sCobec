# Agent guidelines for 2k4sCobec

Instructions for AI agents working in this repo.

## Stack

- **Runtime / package manager**: Bun
- **Backend**: Convex (queries, mutations, actions, schema in `convex/`)
- **Frontend**: TanStack Start (file-based routes in `src/routes/`), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS v4 via `@tailwindcss/vite`
- **Auth**: Clerk (optional; wire via Convex + TanStack Start + Clerk docs)

## Conventions

- **Styling**: Tailwind utility classes in components. Use the `cn()` helper from `~/lib/utils` when merging classes. Global styles and theme (including dark mode) live in `src/styles/app.css`.
- **Convex**: Follow the project’s Convex rules in `.cursor/rules/convex_rules.mdc` (schema, validators, function registration, etc.).
- **New UI components**: Add via `bunx shadcn@latest add <component>`, then import from `~/components/ui/<component>`.
- **UX**: Make sure the application is always in compliant with the "3 click" rule where users can get anywhere in the app (as long as they are authenticated) within 3 clicks.
-- **Data** all DateTimes must be stored in ms because of epoch but on the front end they must display as MM/DD/YYYY MIN:SEC
-- **Code Convention**: All files must have declarative, concise, and eloquent names, that are easy to digest and self explanatory

## Verification

- After changing Convex code (schema or functions), run **`bunx convex dev --once`** to verify and sync with the deployment.

## Scripts

- `bun run dev` – Vite + Convex dev (port 3000)
- `bun run dev:web` – Vite only
- `bun run dev:convex` – Convex only
- `bun run build` – Build and type-check
- `bun run lint` – Type-check and ESLint
- `bun run format` – Prettier

## Env

- Copy `.env.example` to `.env.local`. Set `VITE_CONVEX_URL` (required). Optionally set `VITE_CLERK_PUBLISHABLE_KEY` for auth.
