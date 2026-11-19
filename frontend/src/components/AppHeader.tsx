import { useAuth } from '../auth/AuthContext'
import { Button } from './ui/Button'

export function AppHeader() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <span className="font-bold tracking-tight">Document Approval</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">{user.username}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300">
            {user.role}
          </span>
          <Button variant="secondary" small onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
