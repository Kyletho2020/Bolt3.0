import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('api_key_storage')
        .select('encrypted_key')
        .eq('id', 'c9f1ba25-04c8-4e36-b942-ff20dfa3d8b3')
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setHasApiKey(!!data?.encrypted_key)
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