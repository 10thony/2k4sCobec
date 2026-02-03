import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const statusRowValidator = v.object({
  _id: v.id("fomsStatus"),
  _creationTime: v.number(),
  statusId: v.string(),
  value: v.string(),
});

/**
 * List all FOMS statuses for filters and dropdowns.
 */
export const listFomsStatuses = query({
  args: {},
  returns: v.array(statusRowValidator),
  handler: async (ctx) => {
    return await ctx.db.query("fomsStatus").collect();
  },
});

/**
 * One-time seed: insert R, D, C, A status rows. Idempotent by statusId.
 * Call once from the Convex dashboard or app to populate fomsStatus.
 */
export const seedFomsStatus = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const rows = [
      { statusId: "R", value: "Requested" },
      { statusId: "D", value: "Denied" },
      { statusId: "C", value: "Cancelled" },
      { statusId: "A", value: "Approved" },
    ] as const;
    for (const row of rows) {
      const existing = await ctx.db
        .query("fomsStatus")
        .withIndex("by_statusId", (q) => q.eq("statusId", row.statusId))
        .unique();
      if (!existing) {
        await ctx.db.insert("fomsStatus", row);
      }
    }
    return null;
  },
});
