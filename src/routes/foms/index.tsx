import { Link, createFileRoute } from '@tanstack/react-router'
import { usePaginatedQuery, useQuery, useMutation } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import {
  FomsListFilters,
  FomsRequestCard,
  FomsDenyModal,
} from '~/components/foms'

export const Route = createFileRoute('/foms/')({
  component: FomsListPage,
})

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300

function FomsListPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusId, setStatusId] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [denyModal, setDenyModal] = useState<{
    id: Id<'fomsRequests'>
    requestorName: string
  } | null>(null)
  const [denyReason, setDenyReason] = useState('')

  const dateFromMs = useMemo(() => {
    if (!dateFrom.trim()) return undefined
    const t = new Date(dateFrom).getTime()
    return Number.isNaN(t) ? undefined : t
  }, [dateFrom])
  const dateToMs = useMemo(() => {
    if (!dateTo.trim()) return undefined
    const t = new Date(dateTo).getTime()
    return Number.isNaN(t) ? undefined : t
  }, [dateTo])

  const {
    results: page,
    status: paginationStatus,
    loadMore,
  } = usePaginatedQuery(
    api.fomsRequests.listFomsRequests,
    {
      statusId: statusId || undefined,
      dateFrom: dateFromMs,
      dateTo: dateToMs,
      searchQuery: searchQuery.trim() || undefined,
    },
    { initialNumItems: PAGE_SIZE }
  )

  const statuses = useQuery(api.fomsStatus.listFomsStatuses, {})
  const updateStatus = useMutation(api.fomsRequests.updateFomsRequestStatus)

  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [searchInput])

  const hasActiveFilters =
    !!searchQuery.trim() || !!statusId || !!dateFrom.trim() || !!dateTo.trim()

  const clearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setStatusId(undefined)
    setDateFrom('')
    setDateTo('')
  }

  const handleApprove = async (id: Id<'fomsRequests'>) => {
    try {
      await updateStatus({ id, statusId: 'A' })
    } catch (e) {
      console.error(e)
    }
  }

  const openDenyModal = (id: Id<'fomsRequests'>, requestorName: string) => {
    setDenyModal({ id, requestorName })
    setDenyReason('')
  }

  const handleDenySubmit = async () => {
    if (!denyModal || !denyReason.trim()) return
    try {
      await updateStatus({
        id: denyModal.id,
        statusId: 'D',
        deniedDescription: denyReason.trim(),
      })
      setDenyModal(null)
      setDenyReason('')
    } catch (e) {
      console.error(e)
    }
  }

  const showLoadMore =
    paginationStatus === 'CanLoadMore' || paginationStatus === 'LoadingMore'

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">FOMS Requests</h1>
        <nav className="flex gap-3">
          <Button asChild variant="default" size="sm">
            <Link to="/foms/create">New request</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Home</Link>
          </Button>
        </nav>
      </div>

      <FomsListFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={() => setSearchQuery(searchInput)}
        statusId={statusId}
        onStatusIdChange={setStatusId}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        statuses={statuses ?? []}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {paginationStatus === 'LoadingFirstPage' ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : page.length === 0 ? (
        <p className="text-muted-foreground">
          No requests found. Try adjusting filters or create a new request.
        </p>
      ) : (
        <>
          <ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={{ viewTransitionName: 'foms-grid' }}
          >
            {page.map((item, i) => (
              <FomsRequestCard
                key={item._id}
                item={item}
                index={i}
                onApprove={handleApprove}
                onDeny={openDenyModal}
              />
            ))}
          </ul>
          {showLoadMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => loadMore(PAGE_SIZE)}
                disabled={paginationStatus === 'LoadingMore'}
              >
                {paginationStatus === 'LoadingMore' ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      <FomsDenyModal
        open={!!denyModal}
        onOpenChange={(open) => !open && setDenyModal(null)}
        requestorName={denyModal?.requestorName ?? null}
        reason={denyReason}
        onReasonChange={setDenyReason}
        onCancel={() => setDenyModal(null)}
        onSubmit={handleDenySubmit}
      />
    </main>
  )
}
