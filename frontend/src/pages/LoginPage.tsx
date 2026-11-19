import { useState, type SubmitEvent } from 'react'
import { errorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { cn, styles } from '../lib/styles'

// Created by the accounts/migrations/0002_seed_users.py migration.
const TEST_PASSWORD = 'demo-pass-123'
const TEST_USERS = [
  { username: 'alice', role: 'Submitter', does: 'Submits documents and tracks their status' },
  { username: 'carol', role: 'Submitter', does: 'A second submitter, to show users only see their own' },
  { username: 'bob', role: 'Reviewer', does: 'Approves or rejects pending documents' },
]

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!username.trim() || !password) return setError('Enter your username and password.')

    setBusy(true)
    setError(null)
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  function pickTestUser(name: string) {
    setUsername(name)
    setPassword(TEST_PASSWORD)
    setError(null)
    setShowHelp(false)
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cn(styles.card, 'flex w-full max-w-sm flex-col gap-4 p-8')}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Approval</h1>
          <p className={cn('mt-1 text-sm', styles.muted)}>Sign in to submit or review documents.</p>
        </div>

        {error && <Alert>{error}</Alert>}

        <label className={styles.label}>
          Username
          <input
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>

        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Which account should I use?
        </button>
      </form>

      {showHelp && (
        <Modal title="Test accounts" onClose={() => setShowHelp(false)}>
          <p className={cn('mb-3 text-sm', styles.muted)}>
            All accounts use the password <code className="font-semibold">{TEST_PASSWORD}</code>. Pick one to
            fill in the form.
          </p>
          <ul className="flex flex-col gap-2">
            {TEST_USERS.map((user) => (
              <li key={user.username}>
                <button
                  type="button"
                  onClick={() => pickTestUser(user.username)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span className="font-semibold">{user.username}</span>{' '}
                  <span className={cn('text-xs uppercase', styles.muted)}>{user.role}</span>
                  <span className={cn('block text-sm', styles.muted)}>{user.does}</span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </main>
  )
}
