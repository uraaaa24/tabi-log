import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { PushPin } from './PushPin'
import { Surface } from './Surface'

const meta = {
  title: 'Components/PushPin',
  component: PushPin,
  args: { size: 40 },
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
} satisfies Meta<typeof PushPin>
export default meta
export const Large: StoryObj<typeof meta> = {}
export const Small: StoryObj<typeof meta> = { args: { size: 18 } }
