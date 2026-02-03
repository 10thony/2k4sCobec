# 2k4sCobec

This is a demo web app for AJW 163 to demonstrate the power of Convex via the FOMS workflow currently being implemented in TAPWeb/TAPMobile.

This project uses **bun**, **Convex**, **TanStack Start**, **TypeScript**, **shadcn/ui**, **React**, **Tailwind CSS**, and **Clerk** auth.

Styling is done with **Tailwind CSS v4** via `@tailwindcss/vite`. Global styles and theme (including dark mode) live in `src/styles/app.css`; use Tailwind utility classes in components and the `cn()` helper from `~/lib/utils` when merging classes.

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure Convex** (required)

   Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL`. To get a Convex URL, run once interactively:

   ```bash
   bunx convex dev
   ```

   Log in when prompted; Convex will create a project and print your deployment URL. Add it to `.env.local` as `VITE_CONVEX_URL=<your-url>`, then stop the process and use the scripts below.

3. **Configure Clerk** (required for auth)

   The app is wrapped in Clerk auth; you must set up Clerk and env vars.

   **Client (`.env.local`):**

   - `VITE_CLERK_PUBLISHABLE_KEY` – from [Clerk API keys](https://dashboard.clerk.com/last-active?path=api-keys).
   - `VITE_CLERK_FRONTEND_API_URL` – optional; set if using a custom Clerk Frontend API URL.

   **Convex Dashboard** (Settings → Environment variables):

   - `CLERK_JWT_ISSUER_DOMAIN` – your Clerk **Frontend API URL** (e.g. `https://verb-noun-00.clerk.accounts.dev`). Get it from Clerk Dashboard → JWT templates → create a template named **Convex** and copy the Issuer URL.
   - `CLERK_SECRET_KEY` – optional; use only if Convex functions call Clerk’s backend API.

   After adding Convex env vars, run `bunx convex dev --once` to sync. See [Convex + Clerk](https://docs.convex.dev/auth/clerk) and [TanStack Start + Clerk](https://docs.convex.dev/client/tanstack/tanstack-start/clerk).

## Scripts

- **`bun run dev`** – Starts the Vite dev server and Convex dev in parallel (port 3000). One command runs both; Convex stays in sync with your `convex/` folder while you develop.
- **`bun run dev:web`** – Vite dev server only (requires Convex URL in env).
- **`bun run dev:convex`** – Convex dev only (syncs `convex/` with your deployment).
- **`bun run build`** – Build the app and type-check.
- **`bun run lint`** – Type-check and ESLint.
- **`bun run format`** – Prettier format.

## Adding shadcn components

```bash
bunx shadcn@latest add button
```

Then import from `~/components/ui/button` (or the path shown by the CLI).
