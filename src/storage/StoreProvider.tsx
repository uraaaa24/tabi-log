import type { SQLiteDatabase } from 'expo-sqlite'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { Button } from '../components/TravelUI'
import { openStore } from './database'
import { collectPhotos } from './photos'

const StoreContext = createContext<SQLiteDatabase | null>(null)
export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('保存先の準備ができていません。')
  }
  return store
}
type StoreProviderProps = Readonly<{
  children: ReactNode
}>

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    openStore()
      .then(async (store) => {
        if (controller.signal.aborted) {
          return
        }
        // Cleanup failure must not prevent reading committed records.
        await collectPhotos(store).catch(() => undefined)
        if (!controller.signal.aborted) {
          setDb(store)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(
            '記録を開けませんでした。端末の空き容量を確認して再試行してください。',
          )
        }
      })
    return () => {
      controller.abort()
    }
  }, [attempt])
  if (!db) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {error ? (
          <>
            <Text>{error}</Text>
            <Button
              label="再試行"
              onPress={() => {
                setError('')
                setAttempt(attempt + 1)
              }}
            />
          </>
        ) : (
          <ActivityIndicator accessibilityLabel="記録を準備中" />
        )}
      </View>
    )
  }
  return <StoreContext value={db}>{children}</StoreContext>
}
