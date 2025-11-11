import { useCallback, useState } from 'react'

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (fn: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setData(result)
      return result
    } catch (err: any) {
      setError(err.message || 'Request failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, request, setData }
}
