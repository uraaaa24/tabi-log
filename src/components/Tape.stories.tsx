import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Surface } from './Surface'
import { Tape } from './Tape'

const meta = {
  title: 'Components/Tape',
  component: Tape,
  args: { width: 140, height: 34, rotation: -4 },
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
} satisfies Meta<typeof Tape>
export default meta
export const Strip: StoryObj<typeof meta> = {}
export const Short: StoryObj<typeof meta> = {
  args: { width: 60, height: 20, rotation: 35 },
}
