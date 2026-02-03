import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { cn } from '~/lib/utils'

type FomsDenyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestorName: string | null
  reason: string
  onReasonChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function FomsDenyModal({
  open,
  onOpenChange,
  requestorName,
  reason,
  onReasonChange,
  onCancel,
  onSubmit,
  isSubmitting = false,
}: FomsDenyModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Deny request</DialogTitle>
          <DialogDescription>
            {requestorName
              ? `Provide a reason for denying the request from ${requestorName}.`
              : 'Denial reason is required.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="deny-reason">Denial reason</Label>
          <textarea
            id="deny-reason"
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            placeholder="Reason for denial…"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            aria-required="true"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Denying…' : 'Deny request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
