/**
 * Routes that can have their auth requirement toggled (e.g. for demo days).
 * Used by admin page and root auth logic.
 */
export const MANAGABLE_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/foms', label: 'FOMS' },
  { path: '/foms/create', label: 'New request' },
  { path: '/anotherPage', label: 'Another page' },
] as const

export type ManageableRoutePath = (typeof MANAGABLE_ROUTES)[number]['path']
