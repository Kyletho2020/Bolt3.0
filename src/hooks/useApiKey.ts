import { useState, useEffect } from 'react'

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if OPENAI_API_KEY is configured in environment
      // Since this is client-side, we'll assume it's available if the env var exists
      const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY
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