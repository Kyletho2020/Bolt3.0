import { useState, useEffect } from 'react'
import { ApiKeyService } from '../services/apiKeyService'

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = async () => {
    try {
      setLoading(true)
      setError(null)

      const hasKey = await ApiKeyService.hasApiKey()
      console.log('API Key check:', { hasKey })
      setHasApiKey(hasKey)
    } catch (err) {
      console.error('Error checking API key:', err)
      setError(err instanceof Error ? err.message : 'Failed to check API key')
      setHasApiKey(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkApiKey()
  }, [])

  return { hasApiKey, loading, error, refetch: checkApiKey }
}
