import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { PaperCard } from './PaperCard'

const meta = {
  title: 'Components/PaperCard',
  component: PaperCard,
  args: {
    title: '旅の記録',
    description: '小さな旅も、大切な思い出。',
  },
} satisfies Meta<typeof PaperCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const LongText: Story = {
  args: {
    title: '旅先で見つけた小さな風景',
    description:
      '木漏れ日の道を歩いて、湖のほとりでひと休み。いつもの日常から少し離れて、ゆっくり過ごした一日の思い出。',
  },
}
