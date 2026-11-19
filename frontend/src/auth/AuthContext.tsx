import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { setUnauthorizedHandler, token } from '../api/client'
import type { User } from '../types'

interface Auth {
  user: User | null
  isRestoring: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isRestoring, setIsRestoring] = useState(() => token.get() !== null)

  const signOutLocally = () => {
    token.clear()
    setUser(null)
  }

  useEffect(() => {
    setUnauthorizedHandler(signOutLocally)
    // Restore the session from a saved token on page load.
    if (token.get()) {
      authApi
        .getCurrentUser()
        .then(setUser)
        .catch(signOutLocally)
        .finally(() => setIsRestoring(false))
    }
  }, [])

  async function login(username: string, password: string) {
    const result = await authApi.login(username, password)
    token.set(result.token)
    setUser(result.user)
  }

  async function logout() {
    await authApi.logout().catch(() => {}) // sign out locally even if the server call fails
    signOutLocally()
  }

  return <AuthContext value={{ user, isRestoring, login, logout }}>{children}</AuthContext>
}
