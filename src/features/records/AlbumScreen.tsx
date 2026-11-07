import { router } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView, Text } from 'react-native'

import { Button, Paper, textStyle, titleStyle } from '../../components/TravelUI'
import { photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisit } from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { dateLabel } from './domain/record'
import { ScrapPhoto } from './ScrapPhoto'
import { useRead } from './useRead'

type AlbumScreenProps = Readonly<{
  visitId: string
}>

export const AlbumScreen = ({ visitId }: AlbumScreenProps) => {
  const db = useStore()
  const {
    value: visit,
    error,
    reload,
  } = useRead(useCallback(() => readVisit(db, visitId), [db, visitId]))
  if (!visit) {
    return (
      <Paper>
        <Text>{error || '記録を読み込み中、または記録が見つかりません。'}</Text>
        <Button
          label="再読み込み"
          onPress={reload}
        />
        <Button
          label="戻る"
          onPress={() => {
            router.back()
          }}
        />
      </Paper>
    )
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f2e6cf' }}
      contentContainerStyle={{ padding: 18 }}
    >
      <Button
        label="訪問履歴へ戻る"
        onPress={() => {
          router.dismissTo({
            pathname: '/place/[placeId]',
            params: { placeId: visit.placeId },
          })
        }}
      />
      <Paper>
        <Text style={titleStyle}>
          {prefectures.find((place) => place.id === visit.placeId)?.name}
        </Text>
        <Text style={textStyle}>{dateLabel(visit)}</Text>
        {visit.transports.length > 0 && (
          <Text style={textStyle}>
            {visit.transports
              .map((code) => (code === 'その他' ? visit.otherTransport : code))
              .join('・')}
          </Text>
        )}
        {visit.photos.slice(0, 2).map((photo) => (
          <ScrapPhoto
            key={photo.id}
            photo={photo}
            uri={photoUri(photo.thumbnail)}
            onPress={() => {
              router.push({
                pathname: '/photos/[visitId]',
                params: { visitId, photoId: photo.id },
              })
            }}
          />
        ))}
        {visit.photos.length > 2 && (
          <Button
            label={`写真をすべて見る（${visit.photos.length}枚）`}
            onPress={() => {
              router.push({
                pathname: '/photos/[visitId]',
                params: { visitId },
              })
            }}
          />
        )}
        {visit.diary.length > 0 && <Text style={textStyle}>{visit.diary}</Text>}
      </Paper>
      <Button
        label="この訪問を編集"
        onPress={() => {
          router.push({
            pathname: '/edit',
            params: { placeId: visit.placeId, visitId },
          })
        }}
      />
    </ScrollView>
  )
}
