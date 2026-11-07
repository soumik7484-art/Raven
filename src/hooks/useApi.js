import { useState, useCallback } from 'react'

/**
 * Generic async API request hook with loading/error/unavailable states.
 * Usage:
 *   const { data, loading, error, unavailable, execute } = useApi(scanService.startScan)
 *   execute('https://example.com')
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unavailable, setUnavailable] = useState(false)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    setUnavailable(false)
    setData(null)

    try {
      const result = await apiFn(...args)
      if (result.unavailable) {
        setUnavailable(true)
      } else if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [apiFn])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
    setUnavailable(false)
  }, [])

  return { data, loading, error, unavailable, execute, reset }
}
