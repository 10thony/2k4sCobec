import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

export type FomsStatusOption = { statusId: string; value: string }

type FomsListFiltersProps = {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onSearchSubmit: () => void
  statusId: string | undefined
  onStatusIdChange: (value: string | undefined) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  statuses: FomsStatusOption[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function FomsListFilters({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  statusId,
  onStatusIdChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  statuses,
  hasActiveFilters,
  onClearFilters,
}: FomsListFiltersProps) {
  return (
    <section
      className="min-w-0 space-y-4 rounded-lg border bg-card p-4"
      aria-label="Filters"
    >
      <div className="grid min-w-0 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="foms-search">Search</Label>
          <Input
            className="w-full min-w-0"
            id="foms-search"
            type="search"
            placeholder="Search requests…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit()
            }}
            aria-describedby="search-hint"
          />
          <p id="search-hint" className="text-xs text-muted-foreground">
            Debounced; searches requestor, facility, description, contact.
          </p>
        </div>
        <div className="space-y-2 min-w-0">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={statusId ?? 'all'}
            onValueChange={(v) => onStatusIdChange(v === 'all' ? undefined : v)}
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.statusId} value={s.statusId}>
                  {s.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 min-w-0">
          <Label htmlFor="date-from">From date</Label>
          <Input
            id="date-from"
            type="date"
            className="min-w-0"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div className="space-y-2 min-w-0">
          <Label htmlFor="date-to">To date</Label>
          <Input
            id="date-to"
            type="date"
            className="min-w-0"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </section>
  )
}
