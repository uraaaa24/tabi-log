import { router } from 'expo-router'
import { useCallback } from 'react'
import { Text, View } from 'react-native'

import { Button, titleStyle } from '../components/TravelUI'
import { JapanMap } from '../features/map/JapanMap'
import { useRead } from '../features/records/useRead'
import { useStore } from '../storage/StoreProvider'

const IndexScreen = () => {
  const db = useStore()
  const { value, error, reload } = useRead(
    useCallback(
      () =>
        db.getAllAsync<{ place_id: string }>(
          'SELECT place_id FROM place_states WHERE visited=1',
        ),
      [db],
    ),
  )
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ ...titleStyle, padding: 18 }}>旅の記録 — 日本</Text>
      {error && (
        <>
          <Text accessibilityRole="alert">{error}</Text>
          <Button
            label="再読み込み"
            onPress={reload}
          />
        </>
      )}
      <JapanMap
        visited={value?.map((row) => row.place_id) ?? []}
        onSelect={(id) => {
          router.push({ pathname: '/place/[placeId]', params: { placeId: id } })
        }}
      />
    </View>
  )
}

export default IndexScreen
