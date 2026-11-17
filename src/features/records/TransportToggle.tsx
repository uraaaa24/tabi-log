import { useEffect } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { InkOutline } from '../../components/InkOutline'
import { motion } from '../../components/motion'
import { colors } from '../../components/TravelUI'
import type { Transport } from './domain/record'
import { TransportIcon } from './TransportIcon'

type TransportToggleProps = Readonly<{
  code: Transport
  selected: boolean
  onToggle: () => void
}>

// A round paper token. Selecting it draws a red ring around the icon, like a
// circle marked with a red pen.
export const TransportToggle = ({
  code,
  selected,
  onToggle,
}: TransportToggleProps) => {
  const ring = useSharedValue(selected ? 1 : 0)
  const pressed = useSharedValue(0)
  useEffect(() => {
    ring.value = motion.release(selected ? 1 : 0)
  }, [ring, selected])
  const tokenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }))
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 1.06 - ring.value * 0.06 }],
  }))
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={code}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      hitSlop={4}
      onPressIn={() => {
        pressed.value = motion.press(1)
      }}
      onPressOut={() => {
        pressed.value = motion.release(0)
      }}
      onPress={() => {
        onToggle()
      }}
    >
      <Animated.View
        style={[
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            boxShadow: '1.6px 2.4px 0 #5E3A1E40',
          },
          tokenStyle,
        ]}
      >
        <InkOutline shape="circle" />
        <TransportIcon
          code={code}
          size={30}
          color={colors.primary}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              inset: -3,
              borderRadius: 35,
              borderWidth: 3,
              borderColor: colors.accent,
            },
            ringStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  )
}
