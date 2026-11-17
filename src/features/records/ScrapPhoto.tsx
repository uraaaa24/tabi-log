import { Image, Pressable, Text, View } from 'react-native'

import type { Photo } from './domain/record'

type ScrapPhotoProps = Readonly<{
  photo: Photo
  uri: string
  onPress: () => void
  // 1-based position, announced so photos can be told apart.
  position: number
  showNumber?: boolean
}>

export const ScrapPhoto = ({
  photo,
  uri,
  onPress,
  position,
  showNumber = false,
}: ScrapPhotoProps) => {
  return (
    <View style={{ padding: 12, alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`写真${position}を拡大`}
        onPress={onPress}
        style={{
          width: `${photo.size * 100}%`,
          padding: 6,
          backgroundColor: '#fffdf6',
          transform: [{ rotate: `${photo.rotation}deg` }],
          elevation: 2,
          boxShadow: '1px 3px 6px #46392c30',
        }}
      >
        <View
          style={{
            width: 42,
            height: 12,
            backgroundColor: '#a8b493aa',
            alignSelf: 'center',
            marginTop: -12,
            marginBottom: 5,
          }}
        />
        <Image
          source={{ uri: uri }}
          style={{ width: '100%', aspectRatio: photo.width / photo.height }}
          resizeMode="contain"
        />
        {showNumber && (
          <Text style={{ color: '#67543e', paddingTop: 4 }}>{position}</Text>
        )}
      </Pressable>
    </View>
  )
}
