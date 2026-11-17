import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

import { colors } from './TravelUI'

const backgrounds = {
  board: colors.board,
  paper: colors.background,
} as const

type SurfaceProps = Readonly<{
  // `board` is the plain pin board behind the map and `paper` the page of the
  // other screens; both are flat colours without texture.
  kind: 'board' | 'paper'
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}>

export const Surface = ({ kind, children, style }: SurfaceProps) => {
  return (
    <View style={[{ backgroundColor: backgrounds[kind] }, style]}>
      {children}
    </View>
  )
}
