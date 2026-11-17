import { Image, Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'

import { InkOutline } from '../../components/InkOutline'
import { motion } from '../../components/motion'
import { colors, fonts } from '../../components/TravelUI'

type MorePhotosProps = Readonly<{
  // Total number of photos in the visit, including the ones already shown.
  total: number
  remaining: number
  uris: readonly string[]
  onPress: () => void
}>

const fan = [-9, 6, -2] as const

type FanCardProps = Readonly<{
  angle: number
  index: number
  spread: SharedValue<number>
  uri?: string
  remaining?: number
}>

const FanCard = ({ angle, index, spread, uri, remaining }: FanCardProps) => {
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${angle * (1 + spread.value * 0.3)}deg`,
      },
      { translateX: spread.value * (index - 1) * 3 },
    ],
  }))
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          inset: 8,
          padding: 5,
          backgroundColor: colors.photoFrame,
          borderRadius: 2,
          boxShadow: '1.6px 2.4px 0 #5E3A1E40',
        },
        style,
      ]}
    >
      <InkOutline />
      {uri ? (
        <Image
          source={{ uri }}
          style={{ flex: 1 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          {remaining !== undefined && (
            <Text
              style={{
                color: colors.ink,
                fontFamily: fonts.bold,
                fontSize: 15,
                lineHeight: 24,
                textAlign: 'center',
              }}
            >
              ほか{'\n'}
              <Text style={{ fontSize: 26 }}>{remaining}</Text>枚
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  )
}

// A loose bundle of prints tucked under the last preview. Touching it
// loosens the stack slightly, as a thumb would.
export const MorePhotos = ({
  total,
  remaining,
  uris,
  onPress,
}: MorePhotosProps) => {
  const spread = useSharedValue(0)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`写真をすべて見る（${total}枚）`}
      hitSlop={8}
      onPressIn={() => {
        spread.value = motion.press(1)
      }}
      onPressOut={() => {
        spread.value = motion.release(0)
      }}
      onPress={() => {
        onPress()
      }}
      style={{ width: 128, height: 128 }}
    >
      {fan.map((angle, index) => (
        <FanCard
          key={angle}
          angle={angle}
          index={index}
          spread={spread}
          uri={index < 2 ? uris[index] : undefined}
          remaining={index === 2 ? remaining : undefined}
        />
      ))}
    </Pressable>
  )
}
