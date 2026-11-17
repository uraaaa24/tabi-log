import { Pressable, Text, View } from 'react-native'

import { InkOutline } from '../../components/InkOutline'
import { colors, fonts } from '../../components/TravelUI'
import type { MapKind } from './domain/places'

const options = [
  { value: 'japan', text: '日本', label: '日本地図' },
  { value: 'world', text: '世界', label: '世界地図' },
] as const

type MapSwitchProps = Readonly<{
  value: MapKind
  onChange: (value: MapKind) => void
}>

// Two wooden blocks side by side. The chosen map's block is pushed down onto
// its shadow and stays there, like a latched key on a wooden panel.
export const MapSwitch = ({ value, onChange }: MapSwitchProps) => {
  return (
    <View
      accessibilityRole="radiogroup"
      style={{ flexDirection: 'row', gap: 6 }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            aria-checked={selected}
            hitSlop={{ top: 8, bottom: 8, left: 3, right: 3 }}
            onPress={() => {
              if (!selected) {
                onChange(option.value)
              }
            }}
            style={{ width: 52, height: 36 }}
          >
            {({ pressed }) => {
              const down = selected || pressed
              return (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      // The same offset as the land's shadow on the map.
                      transform: [{ translateX: 1.6 }, { translateY: 2.4 }],
                      backgroundColor: colors.landShadow,
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected
                        ? colors.landPressed
                        : colors.land,
                      transform: down
                        ? [{ translateX: 1.6 }, { translateY: 2.4 }]
                        : [],
                    }}
                  >
                    <Text
                      style={{
                        color: colors.boardText,
                        fontFamily: selected ? fonts.bold : fonts.regular,
                        fontSize: 15,
                      }}
                    >
                      {option.text}
                    </Text>
                    <InkOutline
                      radius={8}
                      strokeWidth={1.4}
                    />
                  </View>
                </>
              )
            }}
          </Pressable>
        )
      })}
    </View>
  )
}
