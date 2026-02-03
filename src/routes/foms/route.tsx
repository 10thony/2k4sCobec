import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/foms')({
  component: FomsLayout,
})

function FomsLayout() {
  return <Outlet />
}
