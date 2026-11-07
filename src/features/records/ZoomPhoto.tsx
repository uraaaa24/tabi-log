import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import type { Photo } from './domain/record'

type ZoomPhotoProps = Readonly<{
  photo: Photo
  uri: string
  width: number
  height: number
}>

export const ZoomPhoto = ({ photo, uri, width, height }: ZoomPhotoProps) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const savedX = useSharedValue(0)
  const savedY = useSharedValue(0)
  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * event.scale))
    })
    .onEnd(() => {
      savedScale.value = scale.value
      if (scale.value === 1) {
        x.value = 0
        y.value = 0
        savedX.value = 0
        savedY.value = 0
      }
    })
  const pan = Gesture.Pan()
    .minPointers(2)
    .onUpdate((event) => {
      if (scale.value > 1) {
        x.value = Math.max(
          -width,
          Math.min(width, savedX.value + event.translationX),
        )
        y.value = Math.max(
          -height,
          Math.min(height, savedY.value + event.translationY),
        )
      }
    })
    .onEnd(() => {
      savedX.value = x.value
      savedY.value = y.value
    })
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }))
  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
      <Animated.Image
        accessibilityLabel={`訪問の写真 ${photo.width}×${photo.height}`}
        source={{ uri }}
        style={[{ width, height }, style]}
        resizeMode="contain"
      />
    </GestureDetector>
  )
}
