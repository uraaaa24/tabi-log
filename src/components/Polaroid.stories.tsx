import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { sampleImageUri } from '../testing/travel'
import { Polaroid } from './Polaroid'
import { PushPin } from './PushPin'
import { Surface } from './Surface'

const meta = {
  title: 'Components/Polaroid',
  component: Polaroid,
  args: { uri: sampleImageUri, width: 200, rotation: -3, tape: 'top' },
  decorators: [
    (Story) => (
      <Surface
        kind="paper"
        style={{ padding: 40, alignItems: 'center' }}
      >
        <Story />
      </Surface>
    ),
  ],
} satisfies Meta<typeof Polaroid>
export default meta
export const Taped: StoryObj<typeof meta> = {}
export const Corners: StoryObj<typeof meta> = {
  args: { tape: 'corners', width: 300, aspectRatio: 1.5, rotation: 2 },
}
export const Pressable: StoryObj<typeof meta> = {
  args: { label: '写真を開く', onPress: () => undefined },
}
export const NoPhoto: StoryObj<typeof meta> = { args: { uri: undefined } }
export const PinnedOnWood: StoryObj<typeof meta> = {
  decorators: [
    (Story) => (
      <Surface
        kind="board"
        style={{ padding: 40, alignItems: 'center' }}
      >
        <Story />
      </Surface>
    ),
  ],
  render: (args) => (
    <View>
      <Polaroid
        {...args}
        width={120}
        tape="none"
        rotation={-6}
      />
      <View style={{ position: 'absolute', top: -30, left: 46 }}>
        <PushPin size={24} />
      </View>
    </View>
  ),
}
