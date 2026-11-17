import { Pressable, View } from 'react-native'

import { colors } from '../../components/TravelUI'

type MapTokenProps = Readonly<{
  name: string
  visited: boolean
  onPress: () => void
  size?: number
}>

// A small round piece of the board's wood standing in for a country too small
// to tap even at the largest zoom. Like the land it lies flat on the board, at
// a fixed size on screen centred on its point; pressing lightens the wood as
// the land does.
export const MapToken = ({
  name,
  visited,
  onPress,
  size = 9,
}: MapTokenProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}、${visited ? '訪問済み' : '未訪問'}`}
      hitSlop={8}
      onPress={() => {
        onPress()
      }}
      style={{ width: size, height: size }}
    >
      {({ pressed }) => (
        <View
          style={{
            flex: 1,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: colors.boardBoundary,
            backgroundColor: pressed ? colors.landPressed : colors.land,
          }}
        />
      )}
    </Pressable>
  )
}
