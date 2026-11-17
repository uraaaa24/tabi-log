import { Text, View } from 'react-native'

import { colors, fonts } from '../../components/TravelUI'
import { findPlace } from './domain/places'
import { PlaceSilhouette } from './PlaceSilhouette'

type PlaceTitleProps = Readonly<{
  placeId: string
  size: number
  pinned?: boolean
}>

// The chosen place at the top of a page: its cut-out shape with the name
// written underneath, since a country's outline alone is rarely recognisable.
export const PlaceTitle = ({
  placeId,
  size,
  pinned = false,
}: PlaceTitleProps) => {
  const name = findPlace(placeId)?.name ?? ''
  // The longest names (e.g. セントビンセント・グレナディーン) fit one line.
  const fontSize = name.length > 12 ? 18 : 22
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <PlaceSilhouette
        placeId={placeId}
        size={size}
        pinned={pinned}
      />
      <Text
        style={{
          color: colors.ink,
          fontFamily: fonts.bold,
          fontSize,
          lineHeight: fontSize * 1.4,
          textAlign: 'center',
        }}
      >
        {name}
      </Text>
    </View>
  )
}
