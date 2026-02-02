# 2k4sCobec

This is a demo web app for AJW 163 to demonstrate the power of Convex via the FOMS workflow currently being implemented in TAPWeb/TAPMobile.

This project uses **bun**, **Convex**, **TanStack Start**, **TypeScript**, **shadcn/ui**, **React**, and **Clerk** auth.

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

3. **Configure Clerk** (optional, for auth)

   To enable auth, add your Clerk publishable key to `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY` and follow the [Convex + TanStack Start + Clerk guide](https://docs.convex.dev/client/tanstack/tanstack-start/clerk) to wire `ConvexProviderWithClerk` and server auth.

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
