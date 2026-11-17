import { useRef, useState } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import Svg, { G, Path } from 'react-native-svg'
import type { GProps } from 'react-native-svg'

import { colors } from '../../components/TravelUI'
import {
  anchoredOffset,
  boundedOffset,
  filledCamera,
  fittedMapSize,
  mapTransform,
  projectPoint,
} from './logic/viewport'
import { MapPin } from './MapPin'
import { MapToken } from './MapToken'

const AnimatedMap = Animated.createAnimatedComponent(G)
const browserSvg = Platform.OS === 'web'

type Camera = Readonly<{
  scale: number
  x: number
  y: number
}>
type MapPlace = Readonly<{
  id: string
  name: string
  path: string
  x: number
  y: number
  // Too small to tap even at the largest zoom; chosen with a round token.
  small?: boolean
}>
type Layout = Readonly<{
  width: number
  height: number
  drawingScale: number
  centerX: number
  centerY: number
}>

type PlacedTokenProps = Readonly<{
  place: MapPlace
  visited: boolean
  camera: SharedValue<Camera>
  layout: Layout
  onSelect: (id: string) => void
}>

const tokenSize = 7

// Keeps a token centred on its place under the current pan and zoom.
const PlacedToken = ({
  place,
  visited,
  camera,
  layout,
  onSelect,
}: PlacedTokenProps) => {
  const style = useAnimatedStyle(() => {
    const { scale, x, y } = camera.value
    return {
      transform: [
        {
          translateX:
            projectPoint(
              place.x,
              layout.centerX,
              layout.width,
              layout.drawingScale,
              scale,
              x,
            ) -
            tokenSize / 2,
        },
        {
          translateY:
            projectPoint(
              place.y,
              layout.centerY,
              layout.height,
              layout.drawingScale,
              scale,
              y,
            ) -
            tokenSize / 2,
        },
      ],
    }
  })
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, style]}>
      <MapToken
        name={place.name}
        visited={visited}
        size={tokenSize}
        onPress={() => {
          onSelect(place.id)
        }}
      />
    </Animated.View>
  )
}

type PlaceMapProps = Readonly<{
  places: readonly MapPlace[]
  frame: Readonly<{
    x: number
    y: number
    width: number
    height: number
  }>
  // Land drawn on the board that cannot be chosen.
  land?: string
  maxScale: number
  // When set, the map opens zoomed in to fill the screen around this point
  // (map units) instead of showing the whole map.
  initialFocus?: Readonly<{ x: number; y: number }>
  visited: readonly string[]
  // False until the visited places have been read from storage.
  ready?: boolean
  // Thumbnail URI per place id, hung from that place's pin.
  photos?: Readonly<Record<string, string>>
  onSelect: (id: string) => void
}>

export const PlaceMap = ({
  places,
  frame,
  land,
  maxScale,
  initialFocus,
  visited,
  ready = true,
  photos = {},
  onSelect,
}: PlaceMapProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pressedId, setPressedId] = useState('')
  // Pins present when the board was first read are already in the wood;
  // only pins added afterwards are pushed in.
  const [initialPins, setInitialPins] = useState<readonly string[] | null>(null)
  if (initialPins === null && ready) {
    setInitialPins(visited)
  }
  const contentSize = fittedMapSize(size.width, size.height, frame)
  const scale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const startScale = useSharedValue(1)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)
  const focalX = useSharedValue(0)
  const focalY = useSharedValue(0)
  const pinching = useSharedValue(false)
  // The opening view is set once; later layouts (rotation, the map being
  // shown again) keep whatever the person has zoomed to.
  const opened = useRef(false)
  const [restScale, setRestScale] = useState(1)
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
      const next = Math.max(
        1,
        Math.min(maxScale, startScale.value * event.scale),
      )
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
  const drawingScale = contentSize.width / frame.width
  const pinSize = Math.max(13, Math.min(22, contentSize.width * 0.042))
  const photoWidth = Math.max(40, Math.min(72, contentSize.width * 0.13))
  const visitedIds = new Set(visited)
  // Southern pins are drawn last so their prints overlap northern ones the
  // way they would if pinned top to bottom.
  // filter() returns a new array, so sorting it leaves `places` untouched.
  const pinned = places
    .filter((place) => visitedIds.has(place.id))
    .sort((a, b) => a.y - b.y)
  const layout = {
    width: size.width,
    height: size.height,
    drawingScale,
    centerX: frame.x + frame.width / 2,
    centerY: frame.y + frame.height / 2,
  }
  const animatedProps = useAnimatedProps<GProps & { matrix?: number[] }>(() => {
    const matrix = mapTransform(
      scale.value,
      x.value,
      y.value,
      contentSize.width / frame.width,
      frame,
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
        const { width, height } = nativeEvent.layout
        if (!opened.current && width > 0 && height > 0) {
          opened.current = true
          if (initialFocus) {
            const start = filledCamera(width, height, frame, initialFocus)
            scale.set(Math.min(maxScale, start.scale))
            setRestScale(Math.min(maxScale, start.scale))
            x.set(start.x)
            y.set(start.y)
          }
        }
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
            viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
          >
            <AnimatedMap animatedProps={animatedProps}>
              {land && (
                <Path
                  d={land}
                  pointerEvents="none"
                  fill={colors.land}
                  stroke={colors.boardBoundary}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fillRule="evenodd"
                />
              )}
              {places.map((place) => (
                <G
                  key={place.id}
                  // A small place is announced and chosen through its token.
                  accessible={
                    Platform.OS !== 'web' && !place.small ? true : undefined
                  }
                  accessibilityRole={
                    Platform.OS === 'web' || place.small ? undefined : 'button'
                  }
                  accessibilityLabel={
                    place.small
                      ? undefined
                      : `${place.name}、${visitedIds.has(place.id) ? '訪問済み' : '未訪問'}`
                  }
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
                    strokeWidth={1}
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
              places
                .filter((place) => place.small)
                .map((place) => (
                  <PlacedToken
                    key={place.id}
                    place={place}
                    visited={visitedIds.has(place.id)}
                    camera={camera}
                    layout={layout}
                    onSelect={onSelect}
                  />
                ))}
            {size.width > 0 &&
              pinned.map((place) => (
                <MapPin
                  key={place.id}
                  id={place.id}
                  name={place.name}
                  x={place.x}
                  y={place.y}
                  camera={camera}
                  layout={layout}
                  uri={photos[place.id]}
                  pinSize={pinSize}
                  photoWidth={photoWidth}
                  restScale={restScale}
                  pushIn={
                    initialPins !== null && !initialPins.includes(place.id)
                  }
                  onPress={() => {
                    onSelect(place.id)
                  }}
                />
              ))}
          </View>
        </View>
      </GestureDetector>
    </View>
  )
}
