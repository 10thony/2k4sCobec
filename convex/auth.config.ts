import type { AuthConfig } from 'convex/server'

/**
 * Convex auth config for Clerk.
 * Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard (Settings → Environment Variables).
 * Use your Clerk Frontend API URL (e.g. https://verb-noun-00.clerk.accounts.dev).
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
