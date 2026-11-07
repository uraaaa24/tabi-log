import { useState } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated'
import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import type { GProps } from 'react-native-svg'

import { colors } from '../../components/TravelUI'
import prefectures from './domain/prefectures.json'
import {
  anchoredOffset,
  boundedOffset,
  fittedMapSize,
  mapTransform,
} from './logic/viewport'

const AnimatedMap = Animated.createAnimatedComponent(G)
const browserSvg = Platform.OS === 'web'

type JapanMapProps = Readonly<{
  visited: readonly string[]
  onSelect: (id: string) => void
}>

export const JapanMap = ({ visited, onSelect }: JapanMapProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const contentSize = fittedMapSize(size.width, size.height)
  const scale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const startScale = useSharedValue(1)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const focalX = useSharedValue(0)
  const focalY = useSharedValue(0)
  const pinching = useSharedValue(false)
  const pinch = Gesture.Pinch()
    .onStart((event) => {
      pinching.value = true
      startScale.value = scale.value
      startX.value = x.value
      startY.value = y.value
      focalX.value = event.focalX - size.width / 2
      focalY.value = event.focalY - size.height / 2
    })
    .onUpdate((event) => {
      const next = Math.max(1, Math.min(6, startScale.value * event.scale))
      x.value = boundedOffset(
        anchoredOffset(
          event.focalX - size.width / 2,
          focalX.value,
          startX.value,
          startScale.value,
          next,
        ),
        size.width,
        next,
        contentSize.width,
      )
      y.value = boundedOffset(
        anchoredOffset(
          event.focalY - size.height / 2,
          focalY.value,
          startY.value,
          startScale.value,
          next,
        ),
        size.height,
        next,
        contentSize.height,
      )
      scale.value = next
    })
    .onFinalize(() => {
      pinching.value = false
    })
  const pan = Gesture.Pan()
    .maxPointers(1)
    .minDistance(8)
    .onChange((event) => {
      if (!pinching.value) {
        x.value = boundedOffset(
          x.value + event.changeX,
          size.width,
          scale.value,
          contentSize.width,
        )
        y.value = boundedOffset(
          y.value + event.changeY,
          size.height,
          scale.value,
          contentSize.height,
        )
      }
    })
  const animatedProps = useAnimatedProps<GProps & { matrix?: number[] }>(() => {
    const matrix = mapTransform(
      scale.value,
      x.value,
      y.value,
      contentSize.width / 550,
    )
    // Native SVG groups receive a matrix; browser SVG groups receive transform.
    // Keep the outer view fixed so zoom redraws vectors instead of enlarging its bitmap.
    return browserSvg ? { transform: matrix } : { matrix }
  })
  return (
    <View
      style={{
        flex: 1,
        overflow: 'hidden',
        backgroundColor: colors.board,
      }}
      onLayout={({ nativeEvent }) => {
        setSize(nativeEvent.layout)
      }}
    >
      <GestureDetector
        gesture={Gesture.Simultaneous(pinch, pan)}
        touchAction="none"
      >
        <View
          style={{ flex: 1 }}
          collapsable={false}
        >
          <Svg
            width={size.width}
            height={size.height}
            viewBox="0 0 550 760"
          >
            <AnimatedMap animatedProps={animatedProps}>
              {prefectures.map((place) => (
                <G
                  key={place.id}
                  accessible={Platform.OS !== 'web' ? true : undefined}
                  accessibilityRole={
                    Platform.OS === 'web' ? undefined : 'button'
                  }
                  accessibilityLabel={`${place.name}、${visited.includes(place.id) ? '訪問済み' : '未訪問'}`}
                  onPress={() => {
                    onSelect(place.id)
                  }}
                >
                  <Path
                    d={place.path}
                    fill={colors.land}
                    stroke={colors.boardBoundary}
                    strokeWidth={0.65}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fillRule="evenodd"
                  />
                  {visited.includes(place.id) && (
                    <G>
                      <Line
                        x1={place.x}
                        y1={place.y}
                        x2={place.x}
                        y2={place.y + 6}
                        stroke={colors.pinNeedle}
                        strokeWidth={1.5}
                      />
                      <Circle
                        cx={place.x}
                        cy={place.y - 2}
                        r={4}
                        fill="#AC4D36"
                      />
                      <Circle
                        cx={place.x - 1}
                        cy={place.y - 3}
                        r={1.2}
                        fill="#EDBA8A"
                      />
                    </G>
                  )}
                </G>
              ))}
            </AnimatedMap>
          </Svg>
        </View>
      </GestureDetector>
    </View>
  )
}
