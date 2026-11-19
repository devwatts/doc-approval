import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { reviewDocument } from '../api/documents'
import type { Doc } from '../types'
import { ReviewActions } from '../components/documents/ReviewActions'

vi.mock('../api/documents', () => ({ reviewDocument: vi.fn() }))

const doc = { id: 1, status: 'pending' } as Doc

describe('ReviewActions', () => {
  it('requires a comment before rejecting', async () => {
    render(<ReviewActions doc={doc} onDone={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reject' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Add a comment')
    expect(reviewDocument).not.toHaveBeenCalled()
  })

  it('approves and tells the page to refresh', async () => {
    const onDone = vi.fn()
    vi.mocked(reviewDocument).mockResolvedValue({ ...doc, status: 'approved' })
    render(<ReviewActions doc={doc} onDone={onDone} />)

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))

    expect(reviewDocument).toHaveBeenCalledWith(1, 'approved', '')
    expect(onDone).toHaveBeenCalled()
  })
})
