import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { InkOutline } from './InkOutline'
import { Surface } from './Surface'
import { colors } from './TravelUI'

const meta = {
  title: 'Components/InkOutline',
  component: InkOutline,
  decorators: [
    (Story, { args }) => (
      <Surface
        kind="paper"
        style={{ padding: 40, alignItems: 'center' }}
      >
        <View
          style={{
            width: args.shape === 'circle' ? 72 : 180,
            height: args.shape === 'circle' ? 72 : 120,
            borderRadius: args.shape === 'circle' ? 36 : 2,
            backgroundColor: colors.photoFrame,
          }}
        >
          <Story />
        </View>
      </Surface>
    ),
  ],
} satisfies Meta<typeof InkOutline>
export default meta
export const Card: StoryObj<typeof meta> = {}
export const Round: StoryObj<typeof meta> = {
  args: { shape: 'circle', strokeWidth: 1.6 },
}
export const Faint: StoryObj<typeof meta> = {
  args: { opacity: 0.4 },
}
