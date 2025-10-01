import { renderHook, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

let useApiKey: typeof import('../src/hooks/useApiKey').useApiKey
let ApiKeyService: typeof import('../src/services/apiKeyService').ApiKeyService

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key')

  ;({ useApiKey } = await import('../src/hooks/useApiKey'))
  ;({ ApiKeyService } = await import('../src/services/apiKeyService'))
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('useApiKey', () => {
  it('reports hasApiKey=true when ApiKeyService resolves truthy', async () => {
    vi.spyOn(ApiKeyService, 'hasApiKey').mockResolvedValue(true)

    const { result } = renderHook(() => useApiKey())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hasApiKey).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
