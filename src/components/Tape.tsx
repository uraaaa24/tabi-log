import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Svg, { Line, Path } from 'react-native-svg'

import { colors } from './TravelUI'

// Torn ends, as fractions of the height, so every strip of tape keeps the
// same hand-cut silhouette regardless of its length.
const tear = [0, 0.18, 0.08, 0.32, 0.22, 0.47, 0.36, 0.62, 0.5, 0.78, 0.66, 1]

function outline(width: number, height: number) {
  const left = tear
    .map((y, index) => `L${index % 2 ? 2.5 : 0},${y * height}`)
    .join(' ')
  const right = tear
    .toReversed()
    .map((y, index) => `L${width - (index % 2 ? 0 : 2.5)},${y * height}`)
    .join(' ')
  return `M0,0 L${width},0 ${right} L${width},${height} L0,${height} ${left} Z`
}

type TapeProps = Readonly<{
  width?: number
  height?: number
  rotation?: number
  style?: StyleProp<ViewStyle>
}>

export const Tape = ({
  width = 96,
  height = 26,
  rotation = 0,
  style,
}: TapeProps) => {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          width,
          height,
          transform: [{ rotate: `${rotation}deg` }],
          boxShadow: '0 1px 2px #5A402614',
        },
        style,
      ]}
    >
      <Svg
        width={width}
        height={height}
      >
        <Path
          d={outline(width, height)}
          fill={colors.tape}
          fillOpacity={0.82}
        />
        <Line
          x1={4}
          x2={width - 4}
          y1={height * 0.3}
          y2={height * 0.3}
          stroke="#FFFFFF"
          strokeOpacity={0.35}
          strokeWidth={height * 0.18}
        />
      </Svg>
    </View>
  )
}
