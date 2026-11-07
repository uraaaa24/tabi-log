import { useState } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'
import Svg, { Circle, G, Line, Path } from 'react-native-svg'

import { colors } from '../../components/TravelUI'
import prefectures from './domain/prefectures.json'
import { anchoredOffset, boundedOffset } from './logic/viewport'

type JapanMapProps = Readonly<{
  visited: readonly string[]
  onSelect: (id: string) => void
}>

export const JapanMap = ({ visited, onSelect }: JapanMapProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
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
      cancelAnimation(x)
      cancelAnimation(y)
      pinching.value = true
      startScale.value = scale.value
      startX.value = x.value
      startY.value = y.value
      focalX.value = event.focalX - size.width / 2
      focalY.value = event.focalY - size.height / 2
    })
    .onUpdate((event) => {
      const next = Math.max(1, Math.min(6, startScale.value * event.scale))
      x.value = anchoredOffset(
        event.focalX - size.width / 2,
        focalX.value,
        startX.value,
        startScale.value,
        next,
      )
      y.value = anchoredOffset(
        event.focalY - size.height / 2,
        focalY.value,
        startY.value,
        startScale.value,
        next,
      )
      scale.value = next
    })
    .onFinalize(() => {
      pinching.value = false
      x.value = withSpring(boundedOffset(x.value, size.width, scale.value), {
        damping: 24,
        stiffness: 220,
      })
      y.value = withSpring(boundedOffset(y.value, size.height, scale.value), {
        damping: 24,
        stiffness: 220,
      })
    })
  const pan = Gesture.Pan()
    .maxPointers(1)
    .minDistance(8)
    .onStart(() => {
      cancelAnimation(x)
      cancelAnimation(y)
    })
    .onChange((event) => {
      if (!pinching.value) {
        x.value = boundedOffset(
          x.value + event.changeX,
          size.width,
          scale.value,
        )
        y.value = boundedOffset(
          y.value + event.changeY,
          size.height,
          scale.value,
        )
      }
    })
    .onEnd((event) => {
      const limitX = (size.width * (scale.value - 1)) / 2
      const limitY = (size.height * (scale.value - 1)) / 2
      x.value = withDecay({
        velocity: event.velocityX,
        clamp: [-limitX, limitX],
      })
      y.value = withDecay({
        velocity: event.velocityY,
        clamp: [-limitY, limitY],
      })
    })
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }))
  return (
    <View
      style={{
        flex: 1,
        overflow: 'hidden',
        backgroundColor: colors.background,
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
          <Animated.View
            style={[{ width: size.width, height: size.height }, style]}
          >
            <Svg
              width={size.width}
              height={size.height}
              viewBox="0 0 550 760"
            >
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
                    fill={visited.includes(place.id) ? '#ADC0AC' : '#D6DDCF'}
                    stroke={colors.background}
                    strokeWidth={1.3}
                  />
                  {visited.includes(place.id) && (
                    <G>
                      <Line
                        x1={place.x}
                        y1={place.y}
                        x2={place.x}
                        y2={place.y + 6}
                        stroke="#7D6354"
                        strokeWidth={1.5}
                      />
                      <Circle
                        cx={place.x}
                        cy={place.y - 2}
                        r={4}
                        fill="#B85C47"
                      />
                      <Circle
                        cx={place.x - 1}
                        cy={place.y - 3}
                        r={1.2}
                        fill="#E6A48D"
                      />
                    </G>
                  )}
                </G>
              ))}
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  )
}
