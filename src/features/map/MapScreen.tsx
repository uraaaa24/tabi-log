import { router, useFocusEffect } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { Button, colors, Header, IconButton } from '../../components/TravelUI'
import { useStore } from '../../storage/StoreProvider'
import { readLatestVisitId, readVisitedPlaceIds } from '../../storage/visits'
import { useRead } from '../records/useRead'
import { JapanMap } from './JapanMap'

export const MapScreen = () => {
  const db = useStore()
  const opening = useRef(false)
  const [selectionError, setSelectionError] = useState('')
  useFocusEffect(
    useCallback(() => {
      opening.current = false
    }, []),
  )
  const { value, error, reload } = useRead(
    useCallback(() => readVisitedPlaceIds(db), [db]),
  )
  const openPlace = async (placeId: string) => {
    if (opening.current) {
      return
    }
    opening.current = true
    setSelectionError('')
    try {
      const visitId = await readLatestVisitId(db, placeId)
      if (visitId) {
        router.push({ pathname: '/album/[visitId]', params: { visitId } })
      } else {
        router.push({ pathname: '/edit', params: { placeId } })
      }
    } catch {
      setSelectionError('記録を開けませんでした。もう一度お試しください。')
      opening.current = false
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="旅の記録"
        actions={
          <IconButton
            label="設定"
            onPress={() => {
              router.push('/settings')
            }}
          >
            <Settings
              size={22}
              color={colors.ink}
              strokeWidth={1.8}
            />
          </IconButton>
        }
      />
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <Text
          style={{ color: colors.primary, fontSize: 32, fontWeight: '600' }}
        >
          {value?.length ?? '—'}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          / 47　訪れた場所
        </Text>
      </View>
      {Boolean(error || selectionError) && (
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            accessibilityRole="alert"
            style={{ color: colors.danger }}
          >
            {error || selectionError}
          </Text>
          {Boolean(error) && (
            <Button
              secondary
              label="再読み込み"
              onPress={reload}
            />
          )}
        </View>
      )}
      {value === null && !error ? (
        <ActivityIndicator
          accessibilityLabel="地図を読み込み中"
          color={colors.primary}
        />
      ) : null}
      <JapanMap
        visited={value ?? []}
        onSelect={(id) => {
          openPlace(id).catch(() => undefined)
        }}
      />
      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
          textAlign: 'center',
          paddingVertical: 16,
        }}
      >
        ピンチで拡大・縮小　ドラッグで移動
      </Text>
    </View>
  )
}
