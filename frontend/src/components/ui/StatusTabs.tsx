import type { Filter } from '../../hooks/useDocuments'
import { cn } from '../../lib/styles'
import type { StatusCounts } from '../../types'

const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected']

interface Props {
  value: Filter
  counts: StatusCounts | null
  onChange: (value: Filter) => void
}

export function StatusTabs({ value, counts, onChange }: Props) {
  const countFor = (filter: Filter) =>
    counts && (filter === 'all' ? counts.pending + counts.approved + counts.rejected : counts[filter])

  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="inline-flex max-w-full flex-wrap rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
    >
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
            value === filter
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
        >
          {filter}
          {counts && <span className="text-xs text-slate-400 tabular-nums">{countFor(filter)}</span>}
        </button>
      ))}
    </div>
  )
}
