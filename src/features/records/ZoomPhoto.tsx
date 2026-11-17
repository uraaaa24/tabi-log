import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { motion } from '../../components/motion'
import type { Photo } from './domain/record'

type ZoomPhotoProps = Readonly<{
  photo: Photo
  uri: string
  width: number
  height: number
  // Reports whether the photo is enlarged, so paging and swipe-to-close can
  // step aside while the user inspects details.
  onZoomChange: (zoomed: boolean) => void
}>

const clamp = (value: number, limit: number) => {
  'worklet'
  return Math.max(-limit, Math.min(limit, value))
}

export const ZoomPhoto = ({
  photo,
  uri,
  width,
  height,
  onZoomChange,
}: ZoomPhotoProps) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const x = useSharedValue(0)
  const y = useSharedValue(0)
  const savedX = useSharedValue(0)
  const savedY = useSharedValue(0)
  // Panning is limited to the enlarged picture's overflow, so its edge never
  // leaves the screen and reveals empty space.
  const limitX = (value: number) => {
    'worklet'
    return (width * (value - 1)) / 2
  }
  const limitY = (value: number) => {
    'worklet'
    return (height * (value - 1)) / 2
  }
  const reset = () => {
    'worklet'
    scale.value = motion.place(1)
    x.value = motion.place(0)
    y.value = motion.place(0)
    savedScale.value = 1
    savedX.value = 0
    savedY.value = 0
  }
  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * event.scale))
    })
    .onEnd(() => {
      savedScale.value = scale.value
      if (scale.value <= 1.02) {
        reset()
      }
    })
    .onFinalize(() => {
      scheduleOnRN(onZoomChange, savedScale.value > 1)
    })
  const pan = Gesture.Pan()
    .minPointers(2)
    .onUpdate((event) => {
      if (scale.value > 1) {
        x.value = clamp(savedX.value + event.translationX, limitX(scale.value))
        y.value = clamp(savedY.value + event.translationY, limitY(scale.value))
      }
    })
    .onEnd(() => {
      savedX.value = x.value
      savedY.value = y.value
    })
  // Double tap brings the photo closer around the tapped point, or back.
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (savedScale.value > 1) {
        reset()
        return
      }
      const next = 2.5
      const targetX = clamp((width / 2 - event.x) * (next - 1), limitX(next))
      const targetY = clamp((height / 2 - event.y) * (next - 1), limitY(next))
      scale.value = motion.place(next)
      x.value = motion.place(targetX)
      y.value = motion.place(targetY)
      savedScale.value = next
      savedX.value = targetX
      savedY.value = targetY
    })
    .onFinalize(() => {
      scheduleOnRN(onZoomChange, savedScale.value > 1)
    })
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }))
  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.Image
        accessibilityLabel={`訪問の写真 ${photo.width}×${photo.height}`}
        source={{ uri }}
        style={[{ width, height }, style]}
        resizeMode="contain"
      />
    </GestureDetector>
  )
}
