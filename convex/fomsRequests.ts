import { paginationOptsValidator } from "convex/server";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

const fomsRequestDocValidator = v.object({
  _id: v.id("fomsRequests"),
  _creationTime: v.number(),
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
  searchText: v.optional(v.string()),
});

const requestWithStatusValidator = fomsRequestDocValidator.extend({
  statusValue: v.string(),
});

const createArgsValidator = {
  dflCode: v.optional(v.string()),
  requestedDatetime: v.number(),
  requestorName: v.string(),
  requestorOrg: v.string(),
  requestorPhone: v.string(),
  requestorNumber: v.optional(v.string()),
  restoration: v.optional(v.string()),
  scheduled: v.optional(v.string()),
  contact: v.string(),
  description: v.string(),
  facility: v.string(),
  pocPhone: v.string(),
};

function buildSearchText(doc: {
  requestorName: string;
  requestorOrg: string;
  requestorPhone: string;
  facility: string;
  description: string;
  contact: string;
  dflCode?: string;
  restoration?: string;
  scheduled?: string;
  deniedDescription?: string;
}): string {
  const parts = [
    doc.requestorName,
    doc.requestorOrg,
    doc.requestorPhone,
    doc.facility,
    doc.description,
    doc.contact,
    doc.dflCode,
    doc.restoration,
    doc.scheduled,
    doc.deniedDescription,
  ].filter(Boolean) as string[];
  return parts.join(" ");
}

/**
 * List FOMS requests with optional pagination, status, date range, and keyword search.
 * Uses search index when searchQuery is present; otherwise uses field indexes.
 */
export const listFomsRequests = query({
  args: {
    paginationOpts: paginationOptsValidator,
    statusId: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
  },
  returns: v.object({
    page: v.array(requestWithStatusValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const statusRows = await ctx.db.query("fomsStatus").collect();
    const statusMap = new Map(statusRows.map((s) => [s.statusId, s.value]));

    const addStatusValue = (doc: Doc<"fomsRequests">) => ({
      ...doc,
      statusValue: statusMap.get(doc.statusId) ?? doc.statusId,
    });

    const hasSearch =
      typeof args.searchQuery === "string" &&
      args.searchQuery.trim().length > 0;
    const hasDate =
      typeof args.dateFrom === "number" || typeof args.dateTo === "number";

    const toReturn = (
      paginated: { page: Doc<"fomsRequests">[]; isDone: boolean; continueCursor: string }
    ) => ({
      page: paginated.page.map(addStatusValue),
      isDone: paginated.isDone,
      continueCursor: paginated.continueCursor,
    });

    if (hasSearch) {
      const searchQ = args.searchQuery!.trim();
      const baseQuery = ctx.db
        .query("fomsRequests")
        .withSearchIndex("search_foms", (q) => {
          let builder = q.search("searchText", searchQ);
          if (args.statusId !== undefined) {
            builder = builder.eq("statusId", args.statusId);
          }
          return builder;
        });
      const paginated = await baseQuery.paginate(args.paginationOpts);
      return toReturn(paginated);
    }

    if (args.statusId !== undefined && hasDate) {
      const from = args.dateFrom ?? 0;
      const to = args.dateTo ?? Number.MAX_SAFE_INTEGER;
      const paginated = await ctx.db
        .query("fomsRequests")
        .withIndex("by_statusId_and_requestedDatetime", (q) =>
          q
            .eq("statusId", args.statusId!)
            .gte("requestedDatetime", from)
            .lte("requestedDatetime", to)
        )
        .order("desc")
        .paginate(args.paginationOpts);
      return toReturn(paginated);
    }

    if (args.statusId !== undefined) {
      const paginated = await ctx.db
        .query("fomsRequests")
        .withIndex("by_statusId", (q) => q.eq("statusId", args.statusId!))
        .order("desc")
        .paginate(args.paginationOpts);
      return toReturn(paginated);
    }

    if (hasDate) {
      const from = args.dateFrom ?? 0;
      const to = args.dateTo ?? Number.MAX_SAFE_INTEGER;
      const paginated = await ctx.db
        .query("fomsRequests")
        .withIndex("by_requestedDatetime", (q) =>
          q.gte("requestedDatetime", from).lte("requestedDatetime", to)
        )
        .order("desc")
        .paginate(args.paginationOpts);
      return toReturn(paginated);
    }

    const paginated = await ctx.db
      .query("fomsRequests")
      .withIndex("by_createDatetime")
      .order("desc")
      .paginate(args.paginationOpts);
    return toReturn(paginated);
  },
});

/**
 * Get a single FOMS request by id for read-only details page.
 */
export const getFomsRequest = query({
  args: { id: v.id("fomsRequests") },
  returns: v.union(requestWithStatusValidator, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    const statusRows = await ctx.db.query("fomsStatus").collect();
    const statusValue =
      statusRows.find((s) => s.statusId === doc.statusId)?.value ?? doc.statusId;
    return { ...doc, statusValue };
  },
});

/**
 * Create a new FOMS request. Sets statusId "R" (Requested) and createDatetime.
 * RMLS ID is Convex _id (server-generated).
 */
export const createFomsRequest = mutation({
  args: createArgsValidator,
  returns: v.id("fomsRequests"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const searchText = buildSearchText({
      requestorName: args.requestorName,
      requestorOrg: args.requestorOrg,
      requestorPhone: args.requestorPhone,
      facility: args.facility,
      description: args.description,
      contact: args.contact,
      dflCode: args.dflCode,
      restoration: args.restoration,
      scheduled: args.scheduled,
    });
    const id = await ctx.db.insert("fomsRequests", {
      createDatetime: now,
      dflCode: args.dflCode,
      requestedDatetime: args.requestedDatetime,
      requestorName: args.requestorName,
      requestorOrg: args.requestorOrg,
      requestorPhone: args.requestorPhone,
      restoration: args.restoration,
      scheduled: args.scheduled,
      contact: args.contact,
      statusId: "R",
      description: args.description,
      facility: args.facility,
      pocPhone: args.pocPhone,
      searchText,
    });
    return id;
  },
});

/** Mock data for seeding: at least 5 requests per status (R, D, C, A). Auth required. */
const MOCK_REQUESTOR_NAMES = [
  "Jane Smith",
  "Marcus Chen",
  "Elena Rodriguez",
  "David Park",
  "Sarah Williams",
];
const MOCK_ORGS = [
  "North Valley EMS",
  "Metro Fire Rescue",
  "County Emergency Services",
  "Rural Health Coalition",
  "City Fire Dept",
];
const MOCK_FACILITIES = [
  "Memorial Hospital ER",
  "Valley Medical Center",
  "Central Trauma Unit",
  "Westside Urgent Care",
  "Regional Health ER",
];
const MOCK_DESCRIPTIONS = [
  "After-hours facility access for equipment pickup",
  "Scheduled training session in main bay",
  "Emergency drill coordination",
  "Quarterly inspection and maintenance",
  "Night shift handoff and supply restock",
];
const MOCK_CONTACTS = [
  "Dr. Amy Foster",
  "Nurse James Lee",
  "Ops Manager Kate Brown",
  "Shift Lead Tom Davis",
  "Admin Maria Garcia",
];
const MOCK_PHONE = "(555) 123-4567";
const MOCK_DFL_CODES = ["DFL-100", "DFL-101", undefined, "DFL-102", undefined];
const MOCK_DENIAL_REASONS = [
  "Insufficient documentation provided.",
  "Requested time slot not available.",
  "Facility at capacity for that date.",
  "Required approval from medical director missing.",
  "Duplicate request on file.",
];

function buildMockFomsRequest(
  statusId: string,
  index: number,
  now: number
): Omit<Doc<"fomsRequests">, "_id" | "_creationTime"> {
  const i = index % MOCK_REQUESTOR_NAMES.length;
  const requestorName = MOCK_REQUESTOR_NAMES[i]!;
  const requestorOrg = MOCK_ORGS[i]!;
  const facility = MOCK_FACILITIES[i]!;
  const description = MOCK_DESCRIPTIONS[i]!;
  const contact = MOCK_CONTACTS[i]!;
  const dflCode = MOCK_DFL_CODES[i];
  const requestedDatetime = now - (index + statusId.charCodeAt(0)) * 3600000;
  const doc = {
    createDatetime: now - index * 60000,
    dflCode,
    requestedDatetime,
    requestorName,
    requestorOrg,
    requestorPhone: MOCK_PHONE,
    restoration: index % 2 === 0 ? "Yes" : undefined,
    scheduled: index % 2 === 1 ? "No" : undefined,
    contact,
    statusId,
    description,
    facility,
    deniedDescription:
      statusId === "D" ? MOCK_DENIAL_REASONS[i] : undefined,
    pocPhone: MOCK_PHONE,
  };
  const searchText = buildSearchText({
    ...doc,
    deniedDescription: doc.deniedDescription,
  });
  return { ...doc, searchText };
}

/**
 * Seed mock FOMS requests for development: at least 5 per status (R, D, C, A).
 * Requires authenticated user.
 */
export const seedMockFomsRequests = mutation({
  args: {},
  returns: v.object({ inserted: v.number() }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in to generate mock data.");
    }
    let statusRows = await ctx.db.query("fomsStatus").collect();
    if (statusRows.length === 0) {
      await ctx.runMutation(api.fomsStatus.seedFomsStatus, {});
      statusRows = await ctx.db.query("fomsStatus").collect();
    }
    const statusIds = statusRows.map((s) => s.statusId);
    const now = Date.now();
    let inserted = 0;
    const countPerStatus = 5;
    for (const statusId of statusIds) {
      for (let i = 0; i < countPerStatus; i++) {
        const doc = buildMockFomsRequest(statusId, inserted + i, now);
        await ctx.db.insert("fomsRequests", doc);
        inserted++;
      }
    }
    return { inserted };
  },
});

/**
 * Update a FOMS request's status (e.g. approve "A" or deny "D").
 * When statusId is "D", deniedDescription is used for the denial reason.
 * Caller must be authenticated (Clerk).
 */
export const updateFomsRequestStatus = mutation({
  args: {
    id: v.id("fomsRequests"),
    statusId: v.string(),
    deniedDescription: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in to approve or deny.");
    }
    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("FOMS request not found.");
    }
    if (args.statusId === "D" && !args.deniedDescription?.trim()) {
      throw new Error("Denial reason (deniedDescription) is required when denying.");
    }
    const updates: Partial<Doc<"fomsRequests">> = {
      statusId: args.statusId,
      ...(args.deniedDescription !== undefined && {
        deniedDescription: args.deniedDescription,
      }),
    };
    if (args.deniedDescription !== undefined) {
      const newSearchText = buildSearchText({
        ...doc,
        deniedDescription: args.deniedDescription,
      });
      updates.searchText = newSearchText;
    }
    await ctx.db.patch(args.id, updates);
    return null;
  },
});
