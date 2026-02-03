import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const authSettingValidator = v.object({
  routePath: v.string(),
  requireAuth: v.boolean(),
})

/**
 * Returns auth state for the app: default public route (when exactly one is public)
 * and the set of route paths that are public.
 */
export const getAuthState = query({
  args: {},
  returns: v.object({
    defaultPublicRoute: v.union(v.string(), v.null()),
    publicRoutePaths: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const all = await ctx.db
      .query('componentAuthSettings')
      .collect()
    const publicPaths = all
      .filter((row) => !row.requireAuth)
      .map((row) => row.routePath)
    const defaultPublicRoute =
      publicPaths.length === 1 ? publicPaths[0]! : null
    return {
      defaultPublicRoute,
      publicRoutePaths: publicPaths,
    }
  },
})

/**
 * Lists all stored auth settings (routePath -> requireAuth).
 * Frontend merges with app-defined route list; missing route = requireAuth true.
 */
export const listSettings = query({
  args: {},
  returns: v.array(authSettingValidator),
  handler: async (ctx) => {
    const rows = await ctx.db.query('componentAuthSettings').collect()
    return rows.map((row) => ({
      routePath: row.routePath,
      requireAuth: row.requireAuth,
    }))
  },
})

/**
 * Sets whether a route requires auth. Creates or updates the row for routePath.
 */
export const setRequireAuth = mutation({
  args: {
    routePath: v.string(),
    requireAuth: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('componentAuthSettings')
      .withIndex('by_routePath', (q) => q.eq('routePath', args.routePath))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, { requireAuth: args.requireAuth })
    } else {
      await ctx.db.insert('componentAuthSettings', {
        routePath: args.routePath,
        requireAuth: args.requireAuth,
      })
    }
    return null
  },
})
