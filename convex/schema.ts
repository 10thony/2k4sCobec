import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  fomsStatus: defineTable({
    statusId: v.string(),
    value: v.string(),
  }).index("by_statusId", ["statusId"]),

  fomsRequests: defineTable({
    createDatetime: v.number(),
    dflCode: v.optional(v.string()),
    requestedDatetime: v.number(),
    requestorName: v.string(),
    requestorOrg: v.string(),
    requestorPhone: v.string(),
    restoration: v.optional(v.string()),
    scheduled: v.optional(v.string()),
    contact: v.string(),
    statusId: v.string(),
    description: v.string(),
    facility: v.string(),
    deniedDescription: v.optional(v.string()),
    pocPhone: v.string(),
    /** Concatenated text for full-text search across request fields */
    searchText: v.optional(v.string()),
  })
    .index("by_statusId", ["statusId"])
    .index("by_requestedDatetime", ["requestedDatetime"])
    .index("by_createDatetime", ["createDatetime"])
    .index("by_statusId_and_requestedDatetime", [
      "statusId",
      "requestedDatetime",
    ])
    .searchIndex("search_foms", {
      searchField: "searchText",
      filterFields: ["statusId"],
      staged: false,
    }),
});
