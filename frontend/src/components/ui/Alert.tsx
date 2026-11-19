import type { ReactNode } from 'react'
import { cn } from '../../lib/styles'

export function Alert({ success, children }: { success?: boolean; children: ReactNode }) {
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={cn(
        'rounded-lg px-4 py-3 text-sm ring-1 ring-inset',
        success
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300'
          : 'bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-950/60 dark:text-rose-300',
      )}
    >
      {children}
    </div>
  )
}
