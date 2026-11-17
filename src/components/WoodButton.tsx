import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { InkOutline } from './InkOutline'
import { motion } from './motion'
import { colors } from './TravelUI'

const tones = {
  wood: colors.land,
  red: colors.danger,
  stone: colors.stone,
} as const

type WoodButtonProps = Readonly<{
  label: string
  onPress: () => void
  children: ReactNode
  tone?: keyof typeof tones
  size?: number
  disabled?: boolean
}>

// A round piece cut from the same wood as the map's land: flat face, ink
// outline and a short offset shadow. Pressing pushes it onto its shadow, like
// pressing a wooden token flat against the board.
export const WoodButton = ({
  label,
  onPress,
  children,
  tone = 'wood',
  size = 64,
  disabled = false,
}: WoodButtonProps) => {
  const pressed = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * 1.6 },
      { translateY: pressed.value * 2.4 },
    ],
    opacity: disabled ? 0.45 : 1,
  }))
  const fill = tones[tone]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPressIn={() => {
        pressed.value = motion.press(1)
      }}
      onPressOut={() => {
        pressed.value = motion.release(0)
      }}
      onPress={() => {
        onPress()
      }}
      style={{ width: size, height: size }}
    >
      <View
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2,
          // The same offset as the land's shadow on the map.
          transform: [{ translateX: 1.6 }, { translateY: 2.4 }],
          backgroundColor: colors.landShadow,
        }}
      />
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <View style={{ flex: 1, backgroundColor: fill }} />
        <InkOutline
          shape="circle"
          strokeWidth={1.6}
        />
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          {children}
        </View>
      </Animated.View>
    </Pressable>
  )
}
