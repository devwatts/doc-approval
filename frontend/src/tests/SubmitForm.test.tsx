import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { submitDocument } from '../api/documents'
import type { Doc } from '../types'
import { SubmitForm } from '../components/documents/SubmitForm'

vi.mock('../api/documents', () => ({ submitDocument: vi.fn() }))

describe('SubmitForm', () => {
  it('blocks incomplete submissions without calling the API', async () => {
    render(<SubmitForm onSubmitted={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    expect(screen.getByText('Give your document a title.')).toBeInTheDocument()
    expect(screen.getByText('Add some text, attach a file, or both.')).toBeInTheDocument()
    expect(submitDocument).not.toHaveBeenCalled()
  })

  it('submits, clears the form and tells the page to refresh', async () => {
    const onSubmitted = vi.fn()
    vi.mocked(submitDocument).mockResolvedValue({ title: 'Budget' } as Doc)
    render(<SubmitForm onSubmitted={onSubmitted} />)

    await userEvent.type(screen.getByLabelText('Title'), 'Budget')
    await userEvent.type(screen.getByLabelText('Content'), 'Details')
    await userEvent.click(screen.getByRole('button', { name: 'Submit for review' }))

    expect(submitDocument).toHaveBeenCalledWith('Budget', 'Details', null)
    expect(await screen.findByText('"Budget" was submitted for review.')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
    expect(onSubmitted).toHaveBeenCalled()
  })
})
