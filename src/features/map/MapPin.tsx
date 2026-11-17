import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'

import { motion } from '../../components/motion'
import { Polaroid } from '../../components/Polaroid'
import { PushPin } from '../../components/PushPin'
import { photoStyle } from '../records/domain/record'
import { projectPoint } from './logic/viewport'

type Camera = Readonly<{
  scale: number
  x: number
  y: number
}>

type Layout = Readonly<{
  width: number
  height: number
  // Pixels per map unit at 1×, and the map frame centre in map units.
  drawingScale: number
  centerX: number
  centerY: number
}>

type MapPinProps = Readonly<{
  id: string
  name: string
  // Where the needle enters the board, in map units.
  x: number
  y: number
  camera: SharedValue<Camera>
  layout: Layout
  uri?: string
  pinSize: number
  photoWidth: number
  // The zoom at which the pin and print are drawn at full size: 1 for a map
  // that opens whole, the opening zoom for one that opens zoomed in.
  restScale?: number
  // True only for a pin added while the map is open (e.g. right after the
  // first record of a place); pins already on the board are simply there.
  pushIn: boolean
  onPress: () => void
}>

// A pin stuck in the board, optionally holding a print. A newly added pin is
// pushed in by hand: it travels down from above, always visible, and stops in
// the wood without rebounding.
export const MapPin = ({
  id,
  name,
  x,
  y,
  camera,
  layout,
  uri,
  pinSize,
  photoWidth,
  restScale = 1,
  pushIn,
  onPress,
}: MapPinProps) => {
  const tilt = photoStyle(id).rotation * 2.4
  const width = uri ? photoWidth : pinSize * 1.3
  const drop = useSharedValue(pushIn ? 0 : 1)
  const press = useSharedValue(0)
  useEffect(() => {
    if (pushIn) {
      drop.value = withDelay(250, motion.place(1))
    }
  }, [drop, pushIn])
  // Prints shrink more slowly than the map grows, so they stay legible when
  // zoomed out but stop covering neighbouring places when zoomed in. Beyond
  // 6× the resting zoom (the world goes to 20×) they keep their size, and
  // zooming out past the resting zoom does not enlarge them.
  const container = useAnimatedStyle(() => {
    const { scale, x: offsetX, y: offsetY } = camera.value
    const zoom = Math.max(1, Math.min(scale / restScale, 6))
    const shrink = Math.pow(zoom, -0.7)
    return {
      transform: [
        {
          translateX: projectPoint(
            x,
            layout.centerX,
            layout.width,
            layout.drawingScale,
            scale,
            offsetX,
          ),
        },
        {
          translateY: projectPoint(
            y,
            layout.centerY,
            layout.height,
            layout.drawingScale,
            scale,
            offsetY,
          ),
        },
        { scale: shrink * (1 + press.value * 0.03) },
      ],
    }
  })
  const pinStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - drop.value) * -pinSize * 1.6 }],
  }))
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ position: 'absolute', left: 0, top: 0 }, container]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}の写真とピン`}
        hitSlop={6}
        onPressIn={() => {
          press.value = motion.press(1)
        }}
        onPressOut={() => {
          press.value = motion.release(0)
        }}
        onPress={() => {
          onPress()
        }}
        // The pin drawing is 1.5 × its size tall with the needle tip at the
        // bottom, so starting 1.5 sizes above the anchor puts the tip on it.
        style={{
          position: 'absolute',
          left: -width / 2,
          top: -pinSize * 1.5,
          width,
          minHeight: pinSize * 1.5,
          alignItems: 'center',
        }}
      >
        {uri && (
          <View
            style={{
              marginTop: pinSize * 1.25,
              transform: [{ rotate: `${tilt}deg` }],
            }}
          >
            <Polaroid
              uri={uri}
              width={photoWidth}
              aspectRatio={1.08}
            />
          </View>
        )}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: width / 2 - pinSize / 2,
            },
            pinStyle,
          ]}
        >
          <PushPin size={pinSize} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}
