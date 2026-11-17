import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

export function useRead<T>(read: () => Promise<T>) {
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      // Keep showing the previous result while re-reading on focus, so
      // returning to a screen does not flash empty or replay entrances.
      setError('')
      read()
        .then((result) => {
          if (!controller.signal.aborted) {
            setValue(result)
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setError('記録を読み込めませんでした。もう一度お試しください。')
          }
        })
      return () => {
        controller.abort(`read revision ${version} disposed`)
      }
    }, [read, version]),
  )
  return {
    value,
    error,
    reload: () => {
      setVersion(version + 1)
    },
  }
}
