# Deploy to Netlify

**This project uses Bun, not npm.** All install and build commands use `bun` / `bunx`. Netlify will use Bun when it detects `bun.lock` in the repo (do not add `package-lock.json` or other lockfiles if you want Bun used).

This project is set up for Netlify with **TanStack Start** (SSR) and **Convex**. The repo already includes:

- `@netlify/vite-plugin-tanstack-start` in `vite.config.ts`
- `netlify.toml` with build command and publish directory

## One-time setup

### 1. Create a Netlify project

1. Go to [app.netlify.com](https://app.netlify.com) and sign in.
2. **Add new project** → **Import an existing project**.
3. Connect your Git provider and select this repository.

### 2. Set the build command and publish directory

In **Site configuration** → **Build & deploy** → **Build settings**:

- **Build command:** `bunx convex deploy --cmd "bun run build"`
- **Publish directory:** `dist/client`

(These are also in `netlify.toml`; the UI will use them if you don’t override.)

### 3. Add Convex production deploy key

1. In [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings**.
2. Under **Deploy keys**, click **Generate** and create a **Production** key. Copy it.
3. In Netlify: **Site configuration** → **Environment variables** → **Add a variable**.
4. Add:
   - **Key:** `CONVEX_DEPLOY_KEY`
   - **Value:** (paste the Convex production deploy key)
   - **Scopes:** Production (and optionally Branch deploys if you use previews).

`bunx convex deploy` uses this key to deploy your Convex backend and to set `VITE_CONVEX_URL` for the frontend build, so the deployed app talks to your production Convex deployment.

### 4. Optional: Clerk production URLs

If you use Clerk:

- In [Clerk Dashboard](https://dashboard.clerk.com), add your Netlify URL (e.g. `https://<site-name>.netlify.app`) to **Allowed redirect URLs** and **Allowed origins**.
- Convex env vars (`CLERK_JWT_ISSUER_DOMAIN`, etc.) are set in the Convex Dashboard and apply to the deployment that `CONVEX_DEPLOY_KEY` targets (production).

### 5. Deploy

Trigger a deploy (e.g. **Deploy site** or push to the connected branch). Netlify will:

1. Run `bunx convex deploy --cmd "bun run build"`.
2. Convex deploys your backend and sets `VITE_CONVEX_URL` for the build.
3. `bun run build` produces the TanStack Start app in `dist/client`.
4. Netlify publishes `dist/client` and runs your SSR via the Netlify TanStack Start plugin.

Your site will be available at `https://<site-name>.netlify.app`.

## Troubleshooting

### `401 Unauthorized: MissingAccessToken` or "An access token is required for this command"

**Cause:** Convex deploy is running without a valid deploy key. This is **not** caused by `npx` vs `bunx`.

**Fix:**

1. In [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Deploy keys**, generate a **Production** deploy key (not a preview key) and copy it.
2. In Netlify → **Site configuration** → **Environment variables**, add (or fix):
   - **Key:** `CONVEX_DEPLOY_KEY` (exact name; Convex looks for this).
   - **Value:** the Production deploy key you copied.
   - **Scopes:** include **Production** (and **Branch deploys** if you want non-preview branch builds to use this key).
3. Trigger a new deploy. Do not override the build command in the Netlify UI; use the command from `netlify.toml` (`bunx convex deploy --cmd "bun run build"`).

If the build log still shows `npx convex deploy` instead of `bunx`, your deployed branch may have an old `netlify.toml`. Push the latest `netlify.toml` (with `bunx`) and redeploy, or clear any build command override in Netlify so the repo’s `netlify.toml` is used.

## Deploy previews (optional)

To use Netlify Deploy Previews with separate Convex preview deployments:

1. In Convex Dashboard → **Settings** → **Deploy keys**, generate a **Preview** deploy key.
2. In Netlify → **Environment variables** → edit `CONVEX_DEPLOY_KEY`:
   - Choose **Different values per deploy context**.
   - Set the **Production** value to your production deploy key.
   - Set the **Deploy Previews** value to your Convex **Preview** deploy key.
3. Optionally add `--preview-run 'someFunction'` to the build command (e.g. `bunx convex deploy --cmd "bun run build" --preview-run 'someFunction'`) to seed preview data (see [Convex preview deployments](https://docs.convex.dev/production/hosting/preview-deployments)).

## Requirements

- **Bun:** This project uses **Bun** (not npm). Netlify detects `bun.lock` and runs `bun install` and your build with Bun. Do not add `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` if you want Bun used. You can set `BUN_VERSION` in Netlify environment variables to pin a Bun version.
- **Netlify CLI:** If you use the CLI for deploys, use **netlify-cli** version **17.31** or higher (required for TanStack Start + `@netlify/vite-plugin-tanstack-start`).

## References

- [TanStack Start on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start)
- [Using Convex with Netlify](https://docs.convex.dev/production/hosting/netlify)
