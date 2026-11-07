import { FlashList } from '@shopify/flash-list'

import type { Photo } from './domain/record'
import { ScrapPhoto } from './ScrapPhoto'

type PhotoGalleryProps = Readonly<{
  photos: Photo[]
  uriFor: (photo: Photo) => string
  onSelect: (photo: Photo) => void
}>

export const PhotoGallery = ({
  photos,
  uriFor,
  onSelect,
}: PhotoGalleryProps) => {
  return (
    <FlashList
      data={photos}
      masonry
      numColumns={2}
      optimizeItemArrangement={false}
      keyExtractor={(photo) => photo.id}
      renderItem={({ item, index }) => (
        <ScrapPhoto
          photo={item}
          uri={uriFor(item)}
          number={index + 1}
          onPress={() => {
            onSelect(item)
          }}
        />
      )}
    />
  )
}
