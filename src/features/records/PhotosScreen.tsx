import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, Modal, Text, View, useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { Button, colors, Header } from '../../components/TravelUI'
import { photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisit } from '../../storage/visits'
import { PhotoGallery } from './PhotoGallery'
import { useRead } from './useRead'
import { ZoomPhoto } from './ZoomPhoto'

type PhotosScreenProps = Readonly<{
  visitId: string
  photoId?: string
}>

export const PhotosScreen = ({ visitId, photoId }: PhotosScreenProps) => {
  const db = useStore()
  const { width, height } = useWindowDimensions()
  const [selected, setSelected] = useState<string | null>(photoId ?? null)
  const {
    value: visit,
    error,
    reload,
  } = useRead(useCallback(() => readVisit(db, visitId), [db, visitId]))
  const index = visit?.photos.findIndex((photo) => photo.id === selected) ?? -1
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="旅の写真"
        onBack={() => {
          router.back()
        }}
      />
      {Boolean(error) && (
        <>
          <Text>{error}</Text>
          <Button
            label="再試行"
            onPress={reload}
          />
        </>
      )}
      <PhotoGallery
        photos={visit?.photos ?? []}
        uriFor={(photo) => photoUri(photo.thumbnail)}
        onSelect={(photo) => {
          setSelected(photo.id)
        }}
      />
      <Modal
        visible={index >= 0}
        onRequestClose={() => {
          setSelected(null)
        }}
      >
        <GestureHandlerRootView
          style={{ flex: 1, backgroundColor: '#241f19', paddingVertical: 36 }}
        >
          <Button
            label="写真一覧へ戻る"
            onPress={() => {
              setSelected(null)
            }}
          />
          <Text style={{ color: 'white', textAlign: 'center' }}>
            左右スワイプで切替・ピンチで拡大・2本指で移動
          </Text>
          {index >= 0 && (
            <FlatList
              key={selected}
              horizontal
              pagingEnabled
              data={visit?.photos ?? []}
              initialScrollIndex={index}
              getItemLayout={(_data, itemIndex) => ({
                length: width,
                offset: width * itemIndex,
                index: itemIndex,
              })}
              keyExtractor={(photo) => photo.id}
              renderItem={({ item }) => (
                <ZoomPhoto
                  photo={item}
                  uri={photoUri(item.path)}
                  width={width}
                  height={height - 150}
                />
              )}
            />
          )}
        </GestureHandlerRootView>
      </Modal>
    </View>
  )
}
