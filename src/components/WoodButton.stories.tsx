import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { ArrowLeft, Check, Pencil, Plus, X } from 'lucide-react-native'
import { View } from 'react-native'

import { Surface } from './Surface'
import { colors } from './TravelUI'
import { WoodButton } from './WoodButton'

const meta = {
  title: 'Components/WoodButton',
  component: WoodButton,
  args: {
    label: '追加',
    onPress: () => undefined,
    children: (
      <Plus
        size={34}
        color={colors.accent}
        strokeWidth={3.5}
      />
    ),
  },
  decorators: [
    (Story) => (
      <Surface
        kind="paper"
        style={{ padding: 32, alignItems: 'center' }}
      >
        <Story />
      </Surface>
    ),
  ],
} satisfies Meta<typeof WoodButton>
export default meta
export const Add: StoryObj<typeof meta> = { args: { size: 84 } }
export const Tones: StoryObj<typeof meta> = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
      <WoodButton
        label="保存"
        tone="red"
        size={76}
        onPress={() => undefined}
      >
        <Check
          size={38}
          color={colors.onPrimary}
          strokeWidth={3}
        />
      </WoodButton>
      <WoodButton
        label="編集"
        onPress={() => undefined}
      >
        <Pencil
          size={28}
          color={colors.ink}
          strokeWidth={2.2}
        />
      </WoodButton>
      <WoodButton
        label="戻る"
        onPress={() => undefined}
      >
        <ArrowLeft
          size={30}
          color={colors.ink}
          strokeWidth={2.4}
        />
      </WoodButton>
      <WoodButton
        label="キャンセル"
        tone="stone"
        size={76}
        onPress={() => undefined}
      >
        <X
          size={38}
          color={colors.onPrimary}
          strokeWidth={2.6}
        />
      </WoodButton>
    </View>
  ),
}
export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } }
