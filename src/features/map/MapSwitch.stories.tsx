import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { View } from 'react-native'

import { colors } from '../../components/TravelUI'
import type { MapKind } from './domain/places'
import { MapSwitch } from './MapSwitch'

const meta = {
  title: 'Map/Switch',
  component: MapSwitch,
  args: { value: 'japan', onChange: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: colors.board }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MapSwitch>
export default meta
export const Japan: StoryObj<typeof meta> = {}
export const World: StoryObj<typeof meta> = { args: { value: 'world' } }

const SwitchingExample = () => {
  const [value, setValue] = useState<MapKind>('japan')
  return (
    <MapSwitch
      value={value}
      onChange={setValue}
    />
  )
}
export const Switching: StoryObj<typeof meta> = {
  render: () => <SwitchingExample />,
}
