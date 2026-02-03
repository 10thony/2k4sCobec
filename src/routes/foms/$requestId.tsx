import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { statusBadgeVariant, formatFomsDateLong } from '~/components/foms'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/foms/$requestId')({
  component: FomsDetailPage,
})

function DetailRow({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-1 py-2 border-b border-border last:border-0', className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? '—'}</dd>
    </div>
  )
}

function FomsDetailPage() {
  const { requestId } = Route.useParams()
  const request = useQuery(
    api.fomsRequests.getFomsRequest,
    requestId ? { id: requestId as Id<'fomsRequests'> } : 'skip'
  )

  if (request === undefined) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    )
  }

  if (request === null) {
    return (
      <main className="p-6">
        <p className="text-destructive">Request not found.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/foms">Back to FOMS list</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          FOMS Request — RMLS ID: {request._id}
        </h1>
        <Badge variant={statusBadgeVariant(request.statusId)} className="w-fit">
          {request.statusValue}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request details</CardTitle>
          <CardDescription>Read-only view. No edit controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <dl>
            <DetailRow label="RMLS ID (Convex _id)" value={String(request._id)} />
            <DetailRow
              label="Create datetime"
              value={formatFomsDateLong(request.createDatetime)}
            />
            <DetailRow
              label="Requested datetime"
              value={formatFomsDateLong(request.requestedDatetime)}
            />
            <DetailRow label="Requestor name" value={request.requestorName} />
            <DetailRow label="Requestor organization" value={request.requestorOrg} />
            <DetailRow label="Requestor phone" value={request.requestorPhone} />
            <DetailRow label="Facility" value={request.facility} />
            <DetailRow label="Description" value={request.description} />
            <DetailRow label="Contact" value={request.contact} />
            <DetailRow label="POC phone" value={request.pocPhone} />
            <DetailRow label="DFL code" value={request.dflCode} />
            <DetailRow label="Restoration" value={request.restoration} />
            <DetailRow label="Scheduled" value={request.scheduled} />
            {request.deniedDescription != null && (
              <DetailRow
                label="Denied description"
                value={request.deniedDescription}
              />
            )}
          </dl>
        </CardContent>
      </Card>

      <nav className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/foms">FOMS list</Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link to="/foms/create">New request</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Home</Link>
        </Button>
      </nav>
    </main>
  )
}
