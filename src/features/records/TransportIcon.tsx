import {
  Bike,
  BusFront,
  CarFront,
  Ellipsis,
  Footprints,
  Plane,
  Ship,
  TrainFront,
  TrainFrontTunnel,
} from 'lucide-react-native'

import type { Transport } from './domain/record'

const icons = {
  車: CarFront,
  電車: TrainFront,
  新幹線: TrainFrontTunnel,
  飛行機: Plane,
  バス: BusFront,
  船: Ship,
  徒歩: Footprints,
  自転車: Bike,
  その他: Ellipsis,
} as const satisfies Record<Transport, unknown>

type TransportIconProps = Readonly<{
  code: Transport
  size: number
  color: string
}>

export const TransportIcon = ({ code, size, color }: TransportIconProps) => {
  const Icon = icons[code]
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={2.2}
      accessibilityElementsHidden
    />
  )
}
