/** Every failed request (network, 4xx, 5xx) becomes one of these. */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Something unexpected went wrong.'

/**
 * Turn a Django REST Framework error body into an ApiError. DRF sends either
 * {"detail": "..."} or validation errors like {"title": ["..."], "non_field_errors": ["..."]}.
 */
export function parseError(status: number, body: unknown): ApiError {
  if (status === 0) return new ApiError(0, "Can't reach the server. Is the backend running?")
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.detail === 'string') return new ApiError(status, record.detail)

    const fieldErrors: Record<string, string[]> = {}
    for (const [field, value] of Object.entries(record)) {
      if (Array.isArray(value)) fieldErrors[field] = value.map(String)
    }
    const message = fieldErrors.non_field_errors?.[0] ?? Object.values(fieldErrors)[0]?.[0]
    if (message) return new ApiError(status, message, fieldErrors)
  }
  return new ApiError(status, status >= 500 ? 'Server error. Please try again.' : 'Request failed.')
}

const TOKEN_KEY = 'token'
export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (value: string) => localStorage.setItem(TOKEN_KEY, value),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

let onUnauthorized = () => {}
/** Called whenever the server rejects our token, so the app can sign out. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

/** fetch() with the auth header, and errors turned into ApiError. */
export async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const saved = token.get()
  if (saved) headers.set('Authorization', `Token ${saved}`)
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw parseError(0, null)
  }

  if (!response.ok) {
    if (response.status === 401 && saved) onUnauthorized()
    throw parseError(response.status, await response.json().catch(() => null))
  }
  return response
}

export async function getJson<T>(path: string): Promise<T> {
  return (await request(path)).json()
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await request(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  })
  return response.status === 204 ? (undefined as T) : response.json()
}
