import type { ReactNode } from 'react'
import type { DocumentsState, Filter } from '../../hooks/useDocuments'
import { cn, styles } from '../../lib/styles'
import type { Doc } from '../../types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { StatusTabs } from '../ui/StatusTabs'

interface Props {
  title: string
  filter: Filter
  onFilterChange: (filter: Filter) => void
  data: DocumentsState
  emptyMessage: string
  renderDoc: (doc: Doc) => ReactNode
}

/** Header with filter tabs, plus the loading / error / empty / list states. */
export function DocumentList({ title, filter, onFilterChange, data, emptyMessage, renderDoc }: Props) {
  const { docs, counts, isLoading, error, reload } = data

  let body: ReactNode
  if (error) {
    body = (
      <Alert>
        {error}{' '}
        <button type="button" className="font-semibold underline" onClick={reload}>
          Try again
        </button>
      </Alert>
    )
  } else if (isLoading && docs.length === 0) {
    body = <p className={cn('py-10 text-center text-sm', styles.muted)}>Loading…</p>
  } else if (docs.length === 0) {
    body = (
      <p
        className={cn(
          'rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm dark:border-slate-700',
          styles.muted,
        )}
      >
        {emptyMessage}
      </p>
    )
  } else {
    body = (
      <ul
        aria-busy={isLoading}
        className={cn('flex flex-col gap-3 transition-opacity', isLoading && 'opacity-60')}
      >
        {docs.map((doc) => (
          <li key={doc.id}>{renderDoc(doc)}</li>
        ))}
      </ul>
    )
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <StatusTabs value={filter} counts={counts} onChange={onFilterChange} />
          <Button variant="secondary" small onClick={reload} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>
      {body}
    </section>
  )
}
