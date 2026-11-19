// Mirrors the backend serializers.

export type Role = 'submitter' | 'reviewer'
export type Status = 'pending' | 'approved' | 'rejected'
export type Decision = Exclude<Status, 'pending'>
export type StatusCounts = Record<Status, number>

export interface User {
  id: number
  username: string
  role: Role
}

// Not called `Document`, to avoid clashing with the browser's global type.
export interface Doc {
  id: number
  title: string
  content: string
  file_name: string | null
  status: Status
  submitted_by: User
  reviewed_by: User | null
  review_comment: string
  reviewed_at: string | null
  created_at: string
}
