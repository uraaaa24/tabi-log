import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { JapanMap } from './JapanMap'

const meta = {
  title: 'Map/Japan',
  component: JapanMap,
  args: { visited: ['JP-13', 'JP-20', 'JP-47'], onSelect: () => undefined },
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ height: 760, width: 390 }}>
        <Story />
      </GestureHandlerRootView>
    ),
  ],
} satisfies Meta<typeof JapanMap>
export default meta
export const WithPins: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { visited: [] } }

const SelectionExample = () => {
  const [selected, setSelected] = useState('未選択')
  return (
    <View style={{ flex: 1 }}>
      <Text>選択：{selected}</Text>
      <JapanMap
        visited={[]}
        onSelect={setSelected}
      />
    </View>
  )
}
export const Selection: StoryObj<typeof meta> = {
  render: () => <SelectionExample />,
}
