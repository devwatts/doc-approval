import { formatDate } from '../../lib/format'
import { cn, styles } from '../../lib/styles'
import type { Doc } from '../../types'

/** Who reviewed the document, when, and their comment. */
export function ReviewOutcome({ doc }: { doc: Doc }) {
  if (doc.status === 'pending') {
    return <p className={cn('text-sm', styles.muted)}>Waiting for a reviewer.</p>
  }

  const approved = doc.status === 'approved'
  return (
    <div className="border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
      <p>
        <strong
          className={approved ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}
        >
          {approved ? 'Approved' : 'Rejected'}
        </strong>{' '}
        by {doc.reviewed_by?.username ?? 'a reviewer'}
        {doc.reviewed_at && <span className={styles.muted}> · {formatDate(doc.reviewed_at)}</span>}
      </p>
      {doc.review_comment && (
        <blockquote
          className={cn(
            'mt-2 border-l-2 pl-3 whitespace-pre-wrap',
            approved ? 'border-emerald-300' : 'border-rose-300',
            styles.muted,
          )}
        >
          {doc.review_comment}
        </blockquote>
      )}
    </div>
  )
}
