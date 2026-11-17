import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { Surface } from './Surface'

const meta = {
  title: 'Components/Surface',
  component: Surface,
  parameters: { layout: 'fullscreen' },
  args: { kind: 'board', style: { width: 390, height: 500 } },
} satisfies Meta<typeof Surface>
export default meta
export const Board: StoryObj<typeof meta> = {}
export const Paper: StoryObj<typeof meta> = { args: { kind: 'paper' } }
