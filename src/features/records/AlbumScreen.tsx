import { router } from 'expo-router'
import { useCallback } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'

import {
  Button,
  colors,
  Header,
  Paper,
  textStyle,
} from '../../components/TravelUI'
import { photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisit } from '../../storage/visits'
import { findPlace } from '../map/domain/places'
import { useRead } from './useRead'
import { VisitAlbum } from './VisitAlbum'

type AlbumScreenProps = Readonly<{
  visitId: string
}>

export const AlbumScreen = ({ visitId }: AlbumScreenProps) => {
  const db = useStore()
  const { width } = useWindowDimensions()
  const { value, error, reload } = useRead(
    useCallback(
      async () => ({ visit: await readVisit(db, visitId) }),
      [db, visitId],
    ),
  )
  const visit = value?.visit
  if (!visit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header
          title="旅の記録"
          onBack={() => {
            router.dismissTo('/')
          }}
        />
        <Paper>
          {error ? (
            <>
              <Text style={textStyle}>{error}</Text>
              <Button
                secondary
                label="再読み込み"
                onPress={reload}
              />
            </>
          ) : (
            <Text style={textStyle}>
              {value ? '記録が見つかりません。' : '記録を読み込み中…'}
            </Text>
          )}
        </Paper>
      </View>
    )
  }
  const openEditor = () => {
    router.push({
      pathname: '/edit',
      params: { placeId: visit.placeId, visitId },
    })
  }
  return (
    <VisitAlbum
      placeName={findPlace(visit.placeId)?.name ?? 'アルバム'}
      visit={visit}
      width={width}
      uriFor={(photo) => photoUri(photo.thumbnail)}
      error={error}
      onBack={() => {
        // Opened right after recording a first trip, the place timeline is
        // not in the stack yet; dismissTo then replaces this screen with it.
        router.dismissTo({
          pathname: '/place/[placeId]',
          params: { placeId: visit.placeId },
        })
      }}
      onEdit={openEditor}
      onOpenPhoto={(photoId) => {
        router.push({
          pathname: '/photos/[visitId]',
          params: { visitId, photoId },
        })
      }}
      onOpenAll={() => {
        router.push({ pathname: '/photos/[visitId]', params: { visitId } })
      }}
    />
  )
}
