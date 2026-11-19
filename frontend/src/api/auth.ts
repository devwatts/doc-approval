import type { User } from '../types'
import { getJson, postJson } from './client'

export const login = (username: string, password: string) =>
  postJson<{ token: string; user: User }>('/auth/login/', { username, password })

export const logout = () => postJson<void>('/auth/logout/')

export const getCurrentUser = () => getJson<User>('/auth/me/')
