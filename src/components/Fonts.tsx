import { ShipporiMincho_500Medium } from '@expo-google-fonts/shippori-mincho/500Medium'
import { ShipporiMincho_700Bold } from '@expo-google-fonts/shippori-mincho/700Bold'
import { useFonts } from 'expo-font'
import type { ReactNode } from 'react'

type FontGateProps = Readonly<{
  children: ReactNode
}>

// Holds the first frame until the bundled fonts are registered so text does
// not reflow from the system font. A failed load falls back to system fonts.
export const FontGate = ({ children }: FontGateProps) => {
  const [loaded, error] = useFonts({
    ShipporiMincho_500Medium,
    ShipporiMincho_700Bold,
  })
  if (!loaded && !error) {
    return null
  }
  return children
}
