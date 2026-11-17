import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'

import { Surface } from '../../components/Surface'
import { Button, colors, fonts } from '../../components/TravelUI'
import { WoodButton } from '../../components/WoodButton'
import { photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisit } from '../../storage/visits'
import { PhotoGallery } from './PhotoGallery'
import { PhotoViewer } from './PhotoViewer'
import { useRead } from './useRead'

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
  const photos = visit?.photos ?? []
  const index = photos.findIndex((photo) => photo.id === selected)
  return (
    <Surface
      kind="paper"
      style={{ flex: 1 }}
    >
      <PhotoGallery
        photos={photos}
        width={width}
        uriFor={(photo) => photoUri(photo.thumbnail)}
        onSelect={(photo) => {
          setSelected(photo.id)
        }}
        header={
          <View style={{ height: 72, justifyContent: 'center' }}>
            {Boolean(error) && (
              <View style={{ marginLeft: 64 }}>
                <Text
                  accessibilityRole="alert"
                  style={{ color: colors.danger, fontFamily: fonts.regular }}
                >
                  {error}
                </Text>
                <Button
                  secondary
                  label="再試行"
                  onPress={reload}
                />
              </View>
            )}
          </View>
        }
      />
      <View style={{ position: 'absolute', top: 12, left: 16 }}>
        <WoodButton
          label="戻る"
          size={48}
          onPress={() => {
            router.back()
          }}
        >
          <ArrowLeft
            size={24}
            color={colors.ink}
            strokeWidth={2.4}
          />
        </WoodButton>
      </View>
      {index >= 0 && (
        <PhotoViewer
          photos={photos}
          index={index}
          width={width}
          height={height}
          uriFor={(photo) => photoUri(photo.path)}
          onClose={() => {
            setSelected(null)
          }}
        />
      )}
    </Surface>
  )
}
