/**
 * FOMS shared helpers — status badge variant, date formatting, text truncation.
 * Used by list cards and detail view.
 */

export type FomsStatusBadgeVariant =
  | 'requested'
  | 'approved'
  | 'denied'
  | 'cancelled'
  | 'secondary'

export function statusBadgeVariant(statusId: string): FomsStatusBadgeVariant {
  switch (statusId) {
    case 'R':
      return 'requested'
    case 'A':
      return 'approved'
    case 'D':
      return 'denied'
    case 'C':
      return 'cancelled'
    default:
      return 'secondary'
  }
}

export function formatFomsDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatFomsDateLong(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max).trim() + '…'
}
