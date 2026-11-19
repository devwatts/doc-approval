import { useState, type ReactNode } from 'react'
import { errorMessage } from '../../api/client'
import { downloadFile } from '../../api/documents'
import { formatDate } from '../../lib/format'
import { cn, styles } from '../../lib/styles'
import type { Doc } from '../../types'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'

interface Props {
  doc: Doc
  showAuthor?: boolean
  /** Shown under the document, e.g. review actions or the review outcome. */
  children?: ReactNode
}

export function DocumentCard({ doc, showAuthor, children }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const isLong = doc.content.length > 300

  return (
    <article aria-label={doc.title} className={cn(styles.card, 'flex flex-col gap-4')}>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{doc.title}</h3>
          <p className={cn('text-sm', styles.muted)}>
            {showAuthor && `By ${doc.submitted_by.username} · `}
            {formatDate(doc.created_at)}
          </p>
        </div>
        <StatusBadge status={doc.status} />
      </header>

      {doc.content && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <p
            className={cn(
              'whitespace-pre-wrap wrap-anywhere',
              isLong && !expanded && 'line-clamp-4',
            )}
          >
            {doc.content}
          </p>
          {isLong && (
            <button
              type="button"
              className="mt-1 font-medium text-indigo-600 dark:text-indigo-400"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {doc.file_name && (
        <div>
          <Button
            variant="secondary"
            small
            onClick={() => downloadFile(doc).catch((error) => setDownloadError(errorMessage(error)))}
          >
            📎 {doc.file_name}
          </Button>
          {downloadError && <p className={styles.error}>{downloadError}</p>}
        </div>
      )}

      {children}
    </article>
  )
}
