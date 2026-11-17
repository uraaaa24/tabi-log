import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'

import { collectPhotos, photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisitDates, setVisited } from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { PlaceTimeline } from './PlaceTimeline'
import { useRead } from './useRead'

type PlaceScreenProps = Readonly<{
  placeId: string
}>

export const PlaceScreen = ({ placeId }: PlaceScreenProps) => {
  const db = useStore()
  const [removing, setRemoving] = useState(false)
  const [actionError, setActionError] = useState('')
  const { value, error } = useRead(
    useCallback(() => readVisitDates(db, placeId), [db, placeId]),
  )
  const visits = value ?? []
  const removePlace = async () => {
    if (removing) {
      return
    }
    setRemoving(true)
    try {
      await setVisited(db, placeId, false)
      await collectPhotos(db).catch(() => undefined)
      router.dismissTo('/')
    } catch {
      setActionError('削除できませんでした。もう一度お試しください。')
    } finally {
      setRemoving(false)
    }
  }
  return (
    <PlaceTimeline
      placeId={placeId}
      placeName={
        prefectures.find((place) => place.id === placeId)?.name ?? '旅の記録'
      }
      visits={visits.map((visit) => ({
        ...visit,
        uri: visit.thumbnail ? photoUri(visit.thumbnail) : null,
      }))}
      busy={removing}
      error={error || actionError}
      onBack={() => {
        router.dismissTo('/')
      }}
      onOpen={(visitId) => {
        router.push({ pathname: '/album/[visitId]', params: { visitId } })
      }}
      onAdd={() => {
        router.push({ pathname: '/edit', params: { placeId } })
      }}
      onRemovePlace={() => {
        Alert.alert(
          'この場所の記録を削除しますか？',
          `${visits.length}回の旅・写真${visits.reduce((total, item) => total + item.photoCount, 0)}枚・日記と地図のピンを削除します。元に戻せません。`,
          [
            { text: 'キャンセル', style: 'cancel' },
            {
              text: '削除',
              style: 'destructive',
              onPress: () => {
                removePlace().catch(() => undefined)
              },
            },
          ],
        )
      }}
    />
  )
}
