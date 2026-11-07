import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { paperCardExamples } from '../testing/paper-card'
import { PaperCard } from './PaperCard'

const meta = {
  title: 'Components/PaperCard',
  component: PaperCard,
  args: paperCardExamples.default,
} satisfies Meta<typeof PaperCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const LongText: Story = { args: paperCardExamples.longText }
