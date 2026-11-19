import { cn } from '../../lib/styles'
import type { Status } from '../../types'

const COLORS: Record<Status, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300',
  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300',
  rejected: 'bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset',
        COLORS[status],
      )}
    >
      {status}
    </span>
  )
}
