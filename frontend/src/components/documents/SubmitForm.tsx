import { useRef, useState, type SubmitEvent } from 'react'
import { ApiError, errorMessage } from '../../api/client'
import { submitDocument } from '../../api/documents'
import { cn, styles } from '../../lib/styles'
import { ALLOWED_EXTENSIONS, validateSubmission, type SubmissionErrors } from '../../lib/validation'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

export function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<SubmissionErrors>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  function reset() {
    setTitle('')
    setContent('')
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(null)
    const clientErrors = validateSubmission(title, content, file)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return

    setBusy(true)
    try {
      const doc = await submitDocument(title.trim(), content, file)
      reset()
      setSuccess(`"${doc.title}" was submitted for review.`)
      onSubmitted()
    } catch (err) {
      // Show server validation errors next to the matching field.
      const fields = err instanceof ApiError ? err.fieldErrors : {}
      setErrors(
        fields.title || fields.file
          ? { title: fields.title?.[0], file: fields.file?.[0] }
          : { form: errorMessage(err) },
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(styles.card, 'flex flex-col gap-4 lg:sticky lg:top-6')}
    >
      <h2 className="text-lg font-semibold">Submit a document</h2>
      {errors.form && <Alert>{errors.form}</Alert>}
      {success && <Alert success>{success}</Alert>}

      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </label>

      <label className={styles.label}>
        Content
        <textarea
          className={styles.input}
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or write the document text"
        />
      </label>

      <label className={styles.label}>
        <span>
          File <span className={cn('font-normal', styles.muted)}>(optional, max 5 MB)</span>
        </span>
        <input
          ref={fileInput}
          type="file"
          accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          aria-invalid={!!errors.file}
          className="min-w-0 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:font-medium file:text-indigo-700"
        />
        {errors.file && <span className={styles.error}>{errors.file}</span>}
      </label>

      <Button type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit for review'}
      </Button>
    </form>
  )
}
