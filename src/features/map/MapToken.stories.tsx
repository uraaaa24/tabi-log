import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { colors } from '../../components/TravelUI'
import { MapToken } from './MapToken'

const meta = {
  title: 'Map/Token',
  component: MapToken,
  args: { name: 'バチカン', visited: false, onPress: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ padding: 32, backgroundColor: colors.board, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MapToken>
export default meta
export const Unvisited: StoryObj<typeof meta> = {}
export const Visited: StoryObj<typeof meta> = { args: { visited: true } }

const PressExample = () => {
  const [count, setCount] = useState(0)
  return (
    <>
      <Text>押した回数：{count}</Text>
      <MapToken
        name="モナコ"
        visited={false}
        onPress={() => {
          setCount(count + 1)
        }}
      />
    </>
  )
}
export const Press: StoryObj<typeof meta> = {
  render: () => <PressExample />,
}
