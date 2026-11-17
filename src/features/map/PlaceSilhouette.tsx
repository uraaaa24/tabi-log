import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { PushPin } from '../../components/PushPin'
import { colors } from '../../components/TravelUI'
import { findPlace, isPrefecture } from './domain/places'
import { mainBounds, pathBounds, squareViewBox } from './logic/shape'

type PlaceSilhouetteProps = Readonly<{
  placeId: string
  size: number
  pinned?: boolean
}>

// The prefecture as the same cut-out piece as on the map, with an optional pin
// stuck in it.
export const PlaceSilhouette = ({
  placeId,
  size,
  pinned = false,
}: PlaceSilhouetteProps) => {
  const place = findPlace(placeId)
  if (!place) {
    return null
  }
  const box = isPrefecture(placeId)
    ? pathBounds(place.path)
    : mainBounds(place.path)
  const viewBox = squareViewBox(box)
  const [left = 0, top = 0, side = 1] = viewBox.split(' ').map(Number)
  const pinSize = size * 0.24
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width={size}
        height={size}
        viewBox={viewBox}
      >
        <Path
          d={place.path}
          transform={`translate(${side * 0.012} ${side * 0.018})`}
          fill={colors.landShadow}
          fillRule="evenodd"
        />
        <Path
          d={place.path}
          fill={colors.land}
          fillRule="evenodd"
          stroke={colors.boardBoundary}
          strokeWidth={side * 0.009}
          strokeLinejoin="round"
        />
      </Svg>
      {pinned && (
        <View
          style={{
            position: 'absolute',
            left: ((place.x - left) / side) * size - pinSize / 2,
            top: ((place.y - top) / side) * size - pinSize * 1.5,
            // Leaning on its needle tip: centred under the head, at the bottom.
            transformOrigin: `${50 / 1.5}% 100%`,
            transform: [{ rotate: '18deg' }],
          }}
        >
          <PushPin size={pinSize} />
        </View>
      )}
    </View>
  )
}
