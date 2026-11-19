// Same limits as the backend, checked here too for instant feedback.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg']

export type SubmissionErrors = Partial<Record<'title' | 'file' | 'form', string>>

export function validateSubmission(title: string, content: string, file: File | null): SubmissionErrors {
  const errors: SubmissionErrors = {}

  if (!title.trim()) errors.title = 'Give your document a title.'
  else if (title.trim().length > 200) errors.title = 'Keep the title under 200 characters.'

  if (!content.trim() && !file) errors.form = 'Add some text, attach a file, or both.'

  if (file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : ''
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.file = `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.`
    } else if (file.size === 0) {
      errors.file = 'That file is empty.'
    } else if (file.size > MAX_UPLOAD_BYTES) {
      errors.file = 'File is too large. The limit is 5 MB.'
    }
  }

  return errors
}
