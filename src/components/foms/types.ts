import type { Id } from '../../../convex/_generated/dataModel'

/**
 * Minimal shape for a FOMS request as returned in the list (with statusValue).
 * Used by FomsRequestCard and list page.
 */
export type FomsRequestListItem = {
  _id: Id<'fomsRequests'>
  statusId: string
  statusValue: string
  requestorName: string
  facility: string
  requestedDatetime: number
  description: string
}
