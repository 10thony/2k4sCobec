# FOMS Implementation Plan

Implementation plan for the FOMS (Field Operations Management System) user stories defined in [FOMS.MD](./FOMS.MD). This document aligns with the project stack ([README.MD](../README.MD)), agent guidelines ([AGENTS.md](./AGENTS.md)), Convex rules (`.cursor/rules/convex_rules.mdc`), and frontend design standards ([FRONTENDDESIGNSKILL.MD](./skills/FRONTENDDESIGNSKILL.MD)).

---

## 1. Overview

### 1.1 Scope

- **User Stories**: Create FOMS requests, view a grid of FOMS request cards, search/filter, view details, and approve/deny pending requests.
- **Stack**: Bun, Convex, TanStack Start, React, TypeScript, shadcn/ui, Tailwind CSS v4, Clerk (auth).
- **Constraints**: 3-click rule (authenticated users reach any screen within 3 clicks); Convex schema/validators and new function syntax; distinctive, production-grade frontend per FRONTENDDESIGNSKILL.MD.

### 1.2 Out of Scope (for this plan)

- Clerk setup and Convex–Clerk wiring (assumed done per README/AGENTS).
- Non-FOMS routes and global layout beyond what’s needed for FOMS navigation.

---

## 2. Data Model & Backend

### 2.1 Schema (Convex)

**File**: `convex/schema.ts`

Transpose the C# `FomsRequest` into Convex tables. Use Convex `_id` as the primary identifier (displayed as “RMLS ID” in the UI; not user-entered).

**Tables**:

| Table         | Purpose                         |
|---------------|---------------------------------|
| `fomsStatus`  | Lookup table for status codes   |
| `fomsRequests`| FOMS request documents          |

**`fomsStatus`**

- `statusId`: string (e.g. `"R"`, `"D"`, `"C"`, `"A"`).
- `value`: string (e.g. `"Requested"`, `"Denied"`, `"Cancelled"`, `"Approved"`).
- Index: `by_statusId` on `["statusId"]` for lookups.

**`fomsRequests`**

Map C# fields to Convex types (DateTime → number, string → string). Use `v.optional()` for nullable/optional fields.

- `createDatetime`: number (ms since epoch).
- `dflCode`: optional string.
- `requestedDatetime`: number.
- `requestorName`: string.
- `requestorOrg`: string.
- `requestorPhone`: string.
- `requestorNumber`: string (if distinct from phone; else treat REQUESTOR_PHONE as the required “REQUESTOR_NUMBER” per 1.c).
- `restoration`: optional string.
- `scheduled`: optional string.
- `contact`: string.
- `statusId`: string (FK to fomsStatus; e.g. `"R"`).
- `description`: string.
- `facility`: string.
- `deniedDescription`: optional string.
- `pocPhone`: string (contact phone; required per 1.c as CONTACT_PHONE).

**Required fields (create form validation, 1.c)**  
`requestorName`, `requestorOrg`, `requestorPhone` (and `requestorNumber` if kept), `facility`, `description`, `requestedDatetime`, `contact`, `pocPhone`.

**Indexes (no `filter`; use indexes per Convex rules)**:

- `by_statusId` → `["statusId"]` (quick filter by status).
- `by_requestedDatetime` → `["requestedDatetime"]` (date range / ordering).
- `by_createDatetime` → `["_creationTime"]` or `["createDatetime"]` (listing order).
- Search: add a Convex search index (e.g. `search_foms`) over text fields for keyword search (2.d). Define in schema and use `withSearchIndex` in a query; combine with index filters for status/date.

**Reference**: `.cursor/rules/convex_rules.mdc` — schema in `convex/schema.ts`, indexes named by fields, no `filter`, use `withIndex` / `withSearchIndex`.

### 2.2 Seed FOMS Status (optional)

One-time mutation or script to insert `fomsStatus` rows: R-Requested, D-Denied, C-Cancelled, A-Approved. Default for new requests: `"R"` (Requested).

### 2.3 Convex Functions

**File layout**: e.g. `convex/fomsRequests.ts` (and optionally `convex/fomsStatus.ts` for status list). Follow file-based API and new function syntax with `args` and `returns` validators.

**Public API**:

1. **`listFomsRequests`** (query)  
   - Args: `paginationOpts` (optional), `statusId` (optional), `dateFrom` (optional number), `dateTo` (optional number), `searchQuery` (optional string).  
   - Use indexes for status and date range; use search index when `searchQuery` is present. Return paginated list of requests (include status value via join or embedded status text).  
   - Returns: validator matching `{ page, isDone, continueCursor }` with document shape including `_id` (used as RMLS ID in UI).

2. **`getFomsRequest`** (query)  
   - Args: `id: v.id("fomsRequests")`.  
   - Returns single request (read-only details page) or null. Include status display value.

3. **`createFomsRequest`** (mutation)  
   - Args: validator with all required/optional fields; no `_id`/RMLS ID (server-generated).  
   - Validate required fields in handler (or via strict validator). Set `statusId: "R"`, `createDatetime: Date.now()`.  
   - Returns: `v.id("fomsRequests")`.

4. **`updateFomsRequestStatus`** (mutation)  
   - Args: `id: v.id("fomsRequests")`, `statusId: v.string()`, `deniedDescription: v.optional(v.string())`.  
   - Used for approve (e.g. `"A"`) and deny (e.g. `"D"`); when `statusId === "D"`, require or use `deniedDescription`.  
   - Auth: ensure caller is authenticated (Clerk identity); optionally restrict to “approver” role if applicable.

5. **`listFomsStatuses`** (query)  
   - Args: none.  
   - Returns list of `fomsStatus` for filters and dropdowns.

**Internal functions**: Use only if needed (e.g. scheduled jobs); prefer public queries/mutations for app-to-Convex flow.

**Validation**: Use Convex validators for all args/returns; use `v.null()` for void returns. No `undefined` in returns.

---

## 3. Frontend Structure & Routes

### 3.1 Route Map (TanStack Start)

- `src/routes/` — file-based routes.
- **3-click rule**: From any authenticated screen, user can reach: FOMS list, FOMS create, FOMS detail, and (from list) approve/deny within 3 clicks.

**Suggested routes**:

| Route                | File (under `src/routes/`) | Purpose                          |
|----------------------|----------------------------|----------------------------------|
| `/`                  | `index.tsx`                | Home / redirect or FOMS list     |
| `/foms`              | `foms/index.tsx`           | FOMS requests grid (cards)       |
| `/foms/new`          | `foms/new.tsx`             | Create FOMS request form         |
| `/foms/$requestId`   | `foms/$requestId.tsx`      | Read-only FOMS request details   |

Navigation: root layout or nav component with links to `/foms`, `/foms/new`; cards link to `/foms/:requestId`. Keep depth ≤ 3 clicks from auth shell.

### 3.2 Auth & Layout

- Wrap FOMS routes with Clerk auth (or Convex auth check). Redirect unauthenticated users to sign-in.
- Use `__root.tsx` for global layout; add nav that includes “FOMS”, “New request”, and (if applicable) “Home” so 3-click rule is satisfied.

---

## 4. User Story 1: Create FOMS Requests

### 4.1 Schema & Types (1.a, 1.b)

- Implement `convex/schema.ts` as in §2.1. Use Convex `_id` as the single primary key; display it as “RMLS ID” on list and detail (never as an input).
- Export TypeScript types from Convex generated types (`Doc<"fomsRequests">`, `Id<"fomsRequests">`) for use in forms and UI.

### 4.2 Create Form (1.c)

- **Page**: `src/routes/foms/new.tsx`.
- **Fields**: Map all FOMS request fields; required: `requestorName`, `requestorOrg`, `requestorPhone` (and `requestorNumber` if in schema), `facility`, `description`, `requestedDatetime`, `contact`, `pocPhone`. Optional: `dflCode`, `restoration`, `scheduled`, etc.
- **Validation**: Client-side with a clear UX (e.g. Zod + react-hook-form, or inline validation). Show field-level and submit-level errors. Match server-side validation in `createFomsRequest` (required fields, types).
- **Datetime**: Use a date/time picker (shadcn or compatible) for `requestedDatetime`; send as number (ms) to Convex.
- **Submit**: Call `createFomsRequest` mutation; on success, redirect to `/foms` or `/foms/:requestId` (within 3 clicks from list).

### 4.3 Status Table & Default (1.d)

- `fomsStatus` table and seed data as in §2.1–2.2. New requests get `statusId: "R"` (Requested). Form does not show status as editable on create.

---

## 5. User Story 2: View Grid of FOMS Request Cards

### 5.1 Grid & Cards (2, 2.a, 2.b)

- **Page**: `src/routes/foms/index.tsx`.
- **Data**: `useQuery(api.fomsRequests.listFomsRequests, { … })` with pagination and optional filters.
- **Layout**: Grid of cards (CSS Grid or flex). Each card:
  - Shows key fields (e.g. requestor, facility, requested date, description snippet).
  - **Status** (2.b): Prominent status badge/label using `fomsStatus.value` (e.g. Requested, Denied, Approved, Cancelled).
  - **Click**: Card or primary CTA navigates to `/foms/:requestId` (read-only details).

### 5.2 Approve / Deny on Card (2.c)

- **Condition**: Only when status is “pending” (treat as `statusId === "R"` — Requested). For other statuses, hide or disable approve/deny.
- **Approve**: Button that calls `updateFomsRequestStatus` with `statusId: "A"`. Optional confirmation dialog.
- **Deny**: Button that opens a **modal** asking for “Denial reason”. On submit, call `updateFomsRequestStatus` with `statusId: "D"` and `deniedDescription` set to the entered text. Modal can be shadcn Dialog.

### 5.3 Keyword Search (2.d)

- **UI**: Search input above or beside the grid.
- **Behavior**: Keyword search across “all columns” (text fields). Implement via Convex search index (e.g. `search_foms`) and pass `searchQuery` to `listFomsRequests`. Date columns are not part of free-text search; use quick filters for dates (2.e).
- **UX**: Debounced input (e.g. 300 ms) to avoid excessive queries. Clear button and loading state.

### 5.4 Quick Filters (2.e)

- **Section**: “Quick filters” above or beside the grid.
- **Filters**:
  - **Date range**: `requestedDatetime` or `createDatetime` (from/to). Use date pickers; send `dateFrom` / `dateTo` as numbers to `listFomsRequests`.
  - **Status**: Dropdown or chips from `listFomsStatuses`; send `statusId` to `listFomsRequests`.
- **UX**: Filters combine with keyword search; one “Clear filters” control. Use indexes for status and date so queries remain efficient (no `filter`).

---

## 6. Read-Only FOMS Details Page (2.a)

- **Page**: `src/routes/foms/$requestId.tsx`.
- **Data**: `useQuery(api.fomsRequests.getFomsRequest, { id })`. Handle loading and not-found.
- **Layout**: Read-only view of all fields: RMLS ID (`_id` displayed), create datetime, requested datetime, requestor info, facility, description, status, contact, POC phone, restoration, scheduled, and (if present) denied description. No edit controls in this view.
- **Navigation**: Link back to `/foms` (and optionally “New request”) so 3-click rule holds.

---

## 7. Frontend Design (FRONTENDDESIGNSKILL.MD)

Apply the frontend design skill for all FOMS UI (list, card, form, detail, modals).

- **Design direction**: Choose one clear direction (e.g. industrial/utilitarian for operations, or refined/minimal for clarity). Document in the plan or in code comments so list, form, and detail stay consistent.
- **Typography**: Distinctive, non-generic fonts (avoid Inter/Roboto/Arial). Pair display + body; set in `src/styles/app.css` and/or Tailwind.
- **Color & theme**: CSS variables in `app.css`; dominant color + accent; support dark mode. Status colors: e.g. Requested = neutral, Approved = green, Denied = red, Cancelled = grey.
- **Motion**: Staggered card appearance on load, subtle hover on cards, modal enter/leave. Prefer CSS or Motion library; keep animations purposeful.
- **Spatial composition**: Clear hierarchy on list (filters + search + grid); card layout with clear status and actions; form with logical grouping and spacing.
- **Components**: Use shadcn via `bunx shadcn@latest add <component>` (e.g. Button, Card, Input, Dialog, Select, Badge, Calendar). Use `cn()` from `~/lib/utils` for class merging. Tailwind-only where no shadcn component exists.

---

## 8. Implementation Order

1. **Convex**
   - Update `convex/schema.ts`: `fomsStatus`, `fomsRequests` and indexes including search index.
   - Seed `fomsStatus` (mutation or script).
   - Implement `convex/fomsRequests.ts`: `listFomsStatuses`, `listFomsRequests`, `getFomsRequest`, `createFomsRequest`, `updateFomsRequestStatus`.
   - Run `bunx convex dev --once` and fix any schema/validator issues.

2. **Routes & layout**
   - Add routes: `foms/index.tsx`, `foms/new.tsx`, `foms/$requestId.tsx`.
   - Update root layout/nav for FOMS links (3-click rule).

3. **Create flow**
   - Build create form on `foms/new.tsx` with validation and `createFomsRequest`.
   - Redirect after success.

4. **List & search/filters**
   - Build grid and cards on `foms/index.tsx` with `listFomsRequests`.
   - Add search input + search index integration.
   - Add quick filters (date range, status).

5. **Detail page**
   - Build read-only `foms/$requestId.tsx` with `getFomsRequest`.

6. **Approve/deny**
   - Add approve/deny on cards (only for status Requested).
   - Add denial modal and `updateFomsRequestStatus` for deny.

7. **Polish**
   - Apply FRONTENDDESIGNSKILL.MD (typography, color, motion, spacing).
   - Verify 3-click rule and a11y (labels, focus, keyboard).

---

## 9. Verification Checklist

- [ ] Schema and functions: `bunx convex dev --once` passes.
- [ ] All Convex functions have `args` and `returns` validators; no `filter` in queries; indexes used.
- [ ] Required fields enforced on create (client + server); RMLS ID never input, only displayed.
- [ ] FOMS list shows status on each card; only Requested cards show approve/deny; deny opens modal and sets `deniedDescription`.
- [ ] Keyword search and quick filters (date, status) work and use indexes/search index.
- [ ] Detail page is read-only and reachable from list within 3 clicks.
- [ ] 3-click rule satisfied from any authenticated FOMS screen.
- [ ] UI follows FRONTENDDESIGNSKILL.MD (distinctive typography, color, motion, no generic AI look).
- [ ] shadcn components added via CLI; styling with Tailwind and `cn()`.

---

## 10. References

- User stories: [FOMS.MD](./FOMS.MD)
- Stack & setup: [README.MD](../README.MD)
- Agent rules: [AGENTS.md](./AGENTS.md)
- Frontend design: [FRONTENDDESIGNSKILL.MD](./skills/FRONTENDDESIGNSKILL.MD)
- Convex: `.cursor/rules/convex_rules.mdc`
