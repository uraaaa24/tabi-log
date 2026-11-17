import { View } from 'react-native'

import { colors } from './TravelUI'

type InkOutlineProps = Readonly<{
  shape?: 'rect' | 'circle'
  color?: string
  strokeWidth?: number
  opacity?: number
  // Match the parent's corner radius for rounded fields.
  radius?: number
}>

// Overlays a thin outline around its parent, in the same brown as the
// prefecture borders on the map. Fills the parent and ignores touches.
export const InkOutline = ({
  shape = 'rect',
  color = colors.outline,
  strokeWidth = 1.2,
  opacity = 0.85,
  radius = 1.5,
}: InkOutlineProps) => {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        inset: 0,
        borderWidth: strokeWidth,
        borderColor: color,
        borderRadius: shape === 'circle' ? 9999 : radius,
        opacity,
      }}
    />
  )
}
