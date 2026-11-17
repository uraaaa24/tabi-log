import { useState } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import Svg, { G, Path } from 'react-native-svg'
import type { GProps } from 'react-native-svg'

import { colors } from '../../components/TravelUI'
import mapFrame from './domain/map-frame.json'
import prefectures from './domain/prefectures.json'
import {
  anchoredOffset,
  boundedOffset,
  fittedMapSize,
  mapTransform,
} from './logic/viewport'
import { MapPin } from './MapPin'

const AnimatedMap = Animated.createAnimatedComponent(G)
const browserSvg = Platform.OS === 'web'

// Southern pins are drawn last so their prints overlap northern ones the way
// they would if pinned top to bottom.
const pinOrder = [...prefectures]
  .sort((a, b) => a.y - b.y)
  .map((place) => place.id)

type JapanMapProps = Readonly<{
  visited: readonly string[]
  // False until the visited places have been read from storage.
  ready?: boolean
  // Thumbnail URI per place id, hung from that place's pin.
  photos?: Readonly<Record<string, string>>
  onSelect: (id: string) => void
}>

export const JapanMap = ({
  visited,
  ready = true,
  photos = {},
  onSelect,
}: JapanMapProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pressedId, setPressedId] = useState('')
  // Pins present when the board was first read are already in the wood;
  // only pins added afterwards are pushed in.
  const [initialPins, setInitialPins] = useState<readonly string[] | null>(null)
  if (initialPins === null && ready) {
    setInitialPins(visited)
  }
  const contentSize = fittedMapSize(size.width, size.height, mapFrame)
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
  const camera = useDerivedValue(() => ({
    scale: scale.value,
    x: x.value,
    y: y.value,
  }))
  const drawingScale = contentSize.width / mapFrame.width
  const pinSize = Math.max(13, Math.min(22, contentSize.width * 0.042))
  const photoWidth = Math.max(40, Math.min(72, contentSize.width * 0.13))
  const visitedInOrder = pinOrder.filter((id) => visited.includes(id))
  const animatedProps = useAnimatedProps<GProps & { matrix?: number[] }>(() => {
    const matrix = mapTransform(
      scale.value,
      x.value,
      y.value,
      contentSize.width / mapFrame.width,
      mapFrame,
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
            viewBox={`${mapFrame.x} ${mapFrame.y} ${mapFrame.width} ${mapFrame.height}`}
          >
            <AnimatedMap animatedProps={animatedProps}>
              {/* The board shows through a shadow offset below-right, so the
              land reads as a thick piece cut out and laid on the board. */}
              <G
                transform="translate(1.6 2.4)"
                pointerEvents="none"
              >
                {prefectures.map((place) => (
                  <Path
                    key={place.id}
                    d={place.path}
                    fill={colors.landShadow}
                    fillRule="evenodd"
                  />
                ))}
              </G>
              {prefectures.map((place) => (
                <G
                  key={place.id}
                  accessible={Platform.OS !== 'web' ? true : undefined}
                  accessibilityRole={
                    Platform.OS === 'web' ? undefined : 'button'
                  }
                  accessibilityLabel={`${place.name}、${visited.includes(place.id) ? '訪問済み' : '未訪問'}`}
                  onPressIn={() => {
                    setPressedId(place.id)
                  }}
                  onPressOut={() => {
                    setPressedId('')
                  }}
                  onPress={() => {
                    onSelect(place.id)
                  }}
                >
                  <Path
                    d={place.path}
                    fill={
                      pressedId === place.id ? colors.landPressed : colors.land
                    }
                    stroke={colors.boardBoundary}
                    strokeWidth={1.1}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fillRule="evenodd"
                  />
                </G>
              ))}
            </AnimatedMap>
          </Svg>
          <View
            style={{ position: 'absolute', inset: 0 }}
            pointerEvents="box-none"
          >
            {size.width > 0 &&
              visitedInOrder.map((id) => {
                const place = prefectures.find((item) => item.id === id)
                return (
                  place && (
                    <MapPin
                      key={id}
                      id={id}
                      name={place.name}
                      x={place.x}
                      y={place.y}
                      camera={camera}
                      layout={{
                        width: size.width,
                        height: size.height,
                        drawingScale,
                        centerX: mapFrame.x + mapFrame.width / 2,
                        centerY: mapFrame.y + mapFrame.height / 2,
                      }}
                      uri={photos[id]}
                      pinSize={pinSize}
                      photoWidth={photoWidth}
                      pushIn={initialPins !== null && !initialPins.includes(id)}
                      onPress={() => {
                        onSelect(id)
                      }}
                    />
                  )
                )
              })}
          </View>
        </View>
      </GestureDetector>
    </View>
  )
}
