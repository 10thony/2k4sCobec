import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { statusBadgeVariant, formatFomsDate, truncate } from './utils'
import type { FomsRequestListItem } from './types'

type FomsRequestCardProps = {
  item: FomsRequestListItem
  index?: number
  onApprove: (id: FomsRequestListItem['_id']) => void
  onDeny: (id: FomsRequestListItem['_id'], requestorName: string) => void
}

export function FomsRequestCard({
  item,
  index = 0,
  onApprove,
  onDeny,
}: FomsRequestCardProps) {
  const isRequested = item.statusId === 'R'

  return (
    <li
      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
    >
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <CardTitle className="text-base">
            <Link
              to="/foms/$requestId"
              params={{ requestId: item._id }}
              className="hover:underline focus:ring-2 focus:ring-ring rounded"
            >
              RMLS ID: {item._id}
            </Link>
          </CardTitle>
          <Badge variant={statusBadgeVariant(item.statusId)}>
            {item.statusValue}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Requestor:</span>{' '}
            {item.requestorName}
          </p>
          <p>
            <span className="text-muted-foreground">Facility:</span>{' '}
            {item.facility}
          </p>
          <p>
            <span className="text-muted-foreground">Requested:</span>{' '}
            {formatFomsDate(item.requestedDatetime)}
          </p>
          <p className="text-muted-foreground">
            {truncate(item.description, 80)}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/foms/$requestId" params={{ requestId: item._id }}>
              View details
            </Link>
          </Button>
          {isRequested && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => onApprove(item._id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeny(item._id, item.requestorName)}
              >
                Deny
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </li>
  )
}
