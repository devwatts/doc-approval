import { afterEach, describe, expect, it, vi } from 'vitest'
import { getJson, parseError, setUnauthorizedHandler, token } from '../api/client'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    token.clear()
  })

  it('turns DRF error bodies into readable messages', () => {
    expect(parseError(409, { detail: 'Already approved.' }).message).toBe('Already approved.')

    const validation = parseError(400, { title: ['Required.'], non_field_errors: ['Add content.'] })
    expect(validation.message).toBe('Add content.')
    expect(validation.fieldErrors.title).toEqual(['Required.'])
  })

  it('sends the token, and signs out when the server rejects it', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    token.set('expired')
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"detail":"Invalid token."}', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getJson('/auth/me/')).rejects.toMatchObject({ status: 401 })

    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Token expired')
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
