import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { getStatusCounts, listDocuments } from '../api/documents'
import type { Doc, Status, StatusCounts } from '../types'

export type Filter = Status | 'all'

interface Loaded {
  key: string
  docs: Doc[]
  counts: StatusCounts | null
  error: string | null
}

/**
 * Loads the documents for a filter, plus per-status counts for the tabs.
 * "Loading" is derived: we're loading while the latest result isn't for the latest request.
 */
export function useDocuments(filter: Filter) {
  const [reloads, setReloads] = useState(0)
  const [loaded, setLoaded] = useState<Loaded>({ key: '', docs: [], counts: null, error: null })
  const key = `${filter}-${reloads}`

  useEffect(() => {
    let stale = false // ignore responses for a request that's been superseded
    Promise.all([listDocuments(filter === 'all' ? undefined : filter), getStatusCounts()])
      .then(([docs, counts]) => !stale && setLoaded({ key, docs, counts, error: null }))
      .catch((error) => !stale && setLoaded((prev) => ({ ...prev, key, error: errorMessage(error) })))
    return () => {
      stale = true
    }
  }, [filter, key])

  const isLoading = loaded.key !== key

  return {
    docs: loaded.docs,
    counts: loaded.counts,
    isLoading,
    error: isLoading ? null : loaded.error,
    reload: useCallback(() => setReloads((n) => n + 1), []),
  }
}

export type DocumentsState = ReturnType<typeof useDocuments>
