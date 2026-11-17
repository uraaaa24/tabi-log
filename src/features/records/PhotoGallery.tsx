import type { ReactElement } from 'react'
import { FlatList } from 'react-native'

import { Polaroid } from '../../components/Polaroid'
import { photoStyle } from './domain/record'
import type { Photo } from './domain/record'

type PhotoGalleryProps = Readonly<{
  photos: Photo[]
  width: number
  uriFor: (photo: Photo) => string
  onSelect: (photo: Photo) => void
  header?: ReactElement
}>

// Every print of a trip taped down the page in the order they were added,
// alternating sides with a hand-placed tilt. Prints never overlap.
export const PhotoGallery = ({
  photos,
  width,
  uriFor,
  onSelect,
  header,
}: PhotoGalleryProps) => {
  const column = Math.min(width - 48, 440)
  return (
    <FlatList
      data={photos}
      keyExtractor={(photo) => photo.id}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
      renderItem={({ item, index }) => {
        const style = photoStyle(item.id)
        const portrait = item.height > item.width
        return (
          <Polaroid
            uri={uriFor(item)}
            kind="print"
            width={
              column *
              (portrait ? 0.68 : 0.86) *
              (0.96 + (style.size - 0.84) * 0.3)
            }
            aspectRatio={item.width / item.height}
            rotation={(index % 2 ? 1.4 : -1.4) + style.rotation * 0.5}
            tape={index % 3 === 1 ? 'corners' : 'top'}
            label={`写真${index + 1}を拡大`}
            onPress={() => {
              onSelect(item)
            }}
            style={{
              alignSelf: index % 2 ? 'flex-end' : 'flex-start',
              marginVertical: 14,
            }}
          />
        )
      }}
    />
  )
}
