import { ImageOff } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Image, Pressable, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { InkOutline } from './InkOutline'
import { motion } from './motion'
import { Tape } from './Tape'
import { colors } from './TravelUI'

type PolaroidProps = Readonly<{
  uri?: string
  width: number
  // Photo area width / height. Defaults to the classic near-square print.
  aspectRatio?: number
  rotation?: number
  tape?: 'top' | 'corners' | 'none'
  // `contain` keeps the whole picture visible, as the album requires.
  fit?: 'cover' | 'contain'
  // `instant` is a cheki with the deep bottom margin; `print` has an even
  // border like a photo printed at a shop.
  kind?: 'instant' | 'print'
  label?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}>

// A printed photo with a white border. When pressable it rises a hair off
// the page, like a fingertip lifting the edge of a print.
export const Polaroid = ({
  uri,
  width,
  aspectRatio = 1.12,
  rotation = 0,
  tape = 'none',
  fit = 'cover',
  kind = 'instant',
  label,
  onPress,
  style,
  children,
}: PolaroidProps) => {
  const lifted = useSharedValue(0)
  const border = Math.max(
    3,
    Math.round(width * (kind === 'instant' ? 0.065 : 0.04)),
  )
  const bottom = kind === 'instant' ? border * 3 : border * 1.4
  const photoWidth = width - border * 2
  const photoHeight = photoWidth / aspectRatio
  const animated = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation}deg` },
      { translateY: lifted.value * -2 },
      { scale: 1 + lifted.value * 0.015 },
    ],
  }))
  const tapeWidth = Math.min(110, width * 0.42)
  const print = (
    <Animated.View
      style={[
        {
          width,
          padding: border,
          paddingBottom: bottom,
          backgroundColor: colors.photoFrame,
          borderRadius: 1.5,
          // Lit from the top left like the board: a tight contact shadow where
          // the card touches, and a soft one cast down and to the right.
          boxShadow: '1.6px 2.4px 0 #5E3A1E40, 2px 3px 4px #5E3A1E1F',
        },
        animated,
      ]}
    >
      <View
        style={{
          width: photoWidth,
          height: photoHeight,
          backgroundColor: fit === 'contain' ? colors.photoFrame : colors.soft,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 0.5px #00000026, inset 0 1px 2px #0000002E',
        }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            resizeMode={fit}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <ImageOff
            size={Math.max(16, photoWidth * 0.22)}
            color={colors.line}
            strokeWidth={1.5}
          />
        )}
      </View>
      <InkOutline />
      {tape === 'top' && (
        <Tape
          width={tapeWidth}
          height={Math.max(14, tapeWidth * 0.26)}
          rotation={-rotation * 0.6 - 2}
          style={{
            position: 'absolute',
            top: -tapeWidth * 0.12,
            left: (width - tapeWidth) / 2,
          }}
        />
      )}
      {tape === 'corners' && (
        <>
          <Tape
            width={tapeWidth * 0.7}
            height={Math.max(12, tapeWidth * 0.22)}
            rotation={-38}
            style={{ position: 'absolute', top: 4, left: -tapeWidth * 0.14 }}
          />
          <Tape
            width={tapeWidth * 0.7}
            height={Math.max(12, tapeWidth * 0.22)}
            rotation={36}
            style={{ position: 'absolute', top: 4, right: -tapeWidth * 0.14 }}
          />
        </>
      )}
      {children}
    </Animated.View>
  )
  if (!onPress) {
    return <View style={style}>{print}</View>
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
      onPressIn={() => {
        lifted.value = motion.press(1)
      }}
      onPressOut={() => {
        lifted.value = motion.release(0)
      }}
      onPress={() => {
        onPress()
      }}
    >
      {print}
    </Pressable>
  )
}
