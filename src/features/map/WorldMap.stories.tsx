import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { sampleImageUri } from '../../testing/travel'
import countries from './domain/countries.json'
import { WorldMap } from './WorldMap'

const meta = {
  title: 'Map/World',
  component: WorldMap,
  args: {
    visited: ['JP', 'FR', 'US', 'VA', 'AU', 'TV'],
    photos: { JP: sampleImageUri, FR: sampleImageUri },
    onSelect: () => undefined,
  },
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ height: 760, width: 390 }}>
        <Story />
      </GestureHandlerRootView>
    ),
  ],
} satisfies Meta<typeof WorldMap>
export default meta
export const WithPins: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { visited: [] } }
export const AllVisited: StoryObj<typeof meta> = {
  args: { visited: countries.map((place) => place.id), photos: {} },
}

const SelectionExample = () => {
  const [selected, setSelected] = useState('未選択')
  return (
    <View style={{ flex: 1 }}>
      <Text>選択：{selected}</Text>
      <WorldMap
        visited={[]}
        onSelect={setSelected}
      />
    </View>
  )
}
export const Selection: StoryObj<typeof meta> = {
  render: () => <SelectionExample />,
}
