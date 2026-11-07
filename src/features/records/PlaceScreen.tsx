import { router } from 'expo-router'
import { usePreventRemove } from 'expo-router/react-navigation'
import { useCallback, useState } from 'react'
import { Alert, FlatList, Image, Text, View } from 'react-native'

import { Button, Paper, textStyle, titleStyle } from '../../components/TravelUI'
import { collectPhotos, photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readHistory, setVisited } from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { dateLabel } from './domain/record'
import { useRead } from './useRead'

type PlaceScreenProps = Readonly<{
  placeId: string
}>

export const PlaceScreen = ({ placeId }: PlaceScreenProps) => {
  const db = useStore()
  const [busy, setBusy] = useState(false)
  usePreventRemove(busy, () => undefined)
  const [actionError, setActionError] = useState('')
  const place = prefectures.find((item) => item.id === placeId)
  const { value, error, reload } = useRead(
    useCallback(
      async () => ({
        visits: await readHistory(db, placeId),
        state: await db.getFirstAsync<{ visited: number }>(
          'SELECT visited FROM place_states WHERE place_id=?',
          placeId,
        ),
      }),
      [db, placeId],
    ),
  )
  const change = async (visited: boolean) => {
    setBusy(true)
    setActionError('')
    try {
      await setVisited(db, placeId, visited)
      await collectPhotos(db).catch(() => undefined)
      reload()
    } catch {
      setActionError('変更できませんでした。再試行してください。')
    } finally {
      setBusy(false)
    }
  }
  const stateLabel = value?.state?.visited
    ? '📌 行った（タップで変更）'
    : '行っていない（タップで変更）'
  const toggle = () => {
    if (value?.state?.visited) {
      Alert.alert(
        '行っていないに戻しますか？',
        `訪問記録${value.visits.length}件、写真${value.visits.reduce((sum, visit) => sum + visit.photos.length, 0)}枚と日記・交通手段を削除します。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除して戻す',
            style: 'destructive',
            onPress: () => {
              change(false).catch(() => undefined)
            },
          },
        ],
      )
    } else {
      change(true).catch(() => undefined)
    }
  }
  if (!place) {
    return <Text>場所が見つかりません。</Text>
  }
  return (
    <View style={{ flex: 1, padding: 18, backgroundColor: '#f2e6cf' }}>
      <Button
        label="地図へ戻る"
        disabled={busy}
        onPress={() => {
          router.back()
        }}
      />
      <Text style={titleStyle}>{place.name}</Text>
      {error || actionError ? (
        <Paper>
          <Text accessibilityRole="alert">{error || actionError}</Text>
          <Button
            label="再読み込み"
            onPress={reload}
          />
        </Paper>
      ) : null}
      <Button
        label={busy ? '変更中…' : stateLabel}
        disabled={busy || !value}
        onPress={toggle}
      />
      <Button
        label="訪問を追加"
        disabled={busy}
        onPress={() => {
          router.push({ pathname: '/edit', params: { placeId } })
        }}
      />
      <FlatList
        data={value?.visits ?? []}
        keyExtractor={(visit) => visit.id}
        ListEmptyComponent={
          <Paper>
            <Text style={textStyle}>
              {value
                ? 'まだ訪問記録がありません。日付が分からない旅は「行った」だけでも残せます。'
                : '読み込み中…'}
            </Text>
          </Paper>
        }
        renderItem={({ item, index }) => (
          <Paper>
            {(index === 0 ||
              value?.visits[index - 1]?.startDate.slice(0, 4) !==
                item.startDate.slice(0, 4)) && (
              <Text style={titleStyle}>{item.startDate.slice(0, 4)}年</Text>
            )}
            {item.photos[0] && (
              <Image
                source={{ uri: photoUri(item.photos[0].thumbnail) }}
                style={{ width: 90, height: 70 }}
                accessibilityLabel="最初に追加した写真"
              />
            )}
            <Button
              label={dateLabel(item)}
              disabled={busy}
              onPress={() => {
                router.push({
                  pathname: '/album/[visitId]',
                  params: { visitId: item.id },
                })
              }}
            />
          </Paper>
        )}
      />
    </View>
  )
}
