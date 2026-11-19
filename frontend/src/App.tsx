import { useAuth } from './auth/AuthContext'
import { AppHeader } from './components/AppHeader'
import { LoginPage } from './pages/LoginPage'
import { ReviewerPage } from './pages/ReviewerPage'
import { SubmitterPage } from './pages/SubmitterPage'

export default function App() {
  const { user, isRestoring } = useAuth()

  if (isRestoring) return <p className="mt-[30vh] text-center text-slate-500">Loading…</p>
  if (!user) return <LoginPage />

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {user.role === 'reviewer' ? <ReviewerPage /> : <SubmitterPage />}
      </main>
    </>
  )
}
