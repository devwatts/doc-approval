import type { Decision, Doc, Status, StatusCounts } from '../types'
import { getJson, postJson, request } from './client'

export const listDocuments = (status?: Status) =>
  getJson<Doc[]>(`/documents/${status ? `?status=${status}` : ''}`)

export const getStatusCounts = () => getJson<StatusCounts>('/documents/counts/')

export function submitDocument(title: string, content: string, file: File | null) {
  const form = new FormData()
  form.append('title', title)
  form.append('content', content)
  if (file) form.append('file', file)
  return postJson<Doc>('/documents/', form)
}

export const reviewDocument = (id: number, decision: Decision, comment: string) =>
  postJson<Doc>(`/documents/${id}/review/`, { decision, comment })

/** Downloads need the auth header, so fetch the file and hand it to the browser. */
export async function downloadFile(doc: Doc) {
  const blob = await (await request(`/documents/${doc.id}/download/`)).blob()
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: doc.file_name })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
