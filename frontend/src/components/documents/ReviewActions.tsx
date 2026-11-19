import { useState } from 'react'
import { ApiError, errorMessage } from '../../api/client'
import { reviewDocument } from '../../api/documents'
import { cn, styles } from '../../lib/styles'
import type { Decision, Doc } from '../../types'
import { Button } from '../ui/Button'

/** Comment box with Approve / Reject buttons for a pending document. */
export function ReviewActions({ doc, onDone }: { doc: Doc; onDone: () => void }) {
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(decision: Decision) {
    if (decision === 'rejected' && !comment.trim()) {
      return setError('Add a comment so the submitter knows why it was rejected.')
    }
    setBusy(decision)
    setError(null)
    try {
      await reviewDocument(doc.id, decision, comment.trim())
      onDone()
    } catch (err) {
      setError((err instanceof ApiError && err.fieldErrors.comment?.[0]) || errorMessage(err))
      if (err instanceof ApiError && err.status === 409) onDone() // someone else reviewed it first
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <label className={styles.label}>
        <span>
          Comment <span className={cn('font-normal', styles.muted)}>(required to reject)</span>
        </span>
        <textarea
          className={styles.input}
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!!busy}
        />
      </label>
      <div className="flex gap-2">
        <Button variant="approve" onClick={() => void submit('approved')} disabled={!!busy}>
          {busy === 'approved' ? 'Approving…' : 'Approve'}
        </Button>
        <Button variant="reject" onClick={() => void submit('rejected')} disabled={!!busy}>
          {busy === 'rejected' ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>
    </div>
  )
}
