import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { colors } from '../../components/TravelUI'
import { PlaceSilhouette } from './PlaceSilhouette'

const meta = {
  title: 'Map/PlaceSilhouette',
  component: PlaceSilhouette,
  args: { placeId: 'JP-20', size: 96, pinned: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: colors.background }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PlaceSilhouette>
export default meta
export const Prefecture: StoryObj<typeof meta> = {}

// Countries whose territory is far-flung, very long or tiny.
const countries = ['US', 'FR', 'RU', 'NO', 'CL', 'ID', 'KI', 'VA', 'SG', 'TV']
export const Countries: StoryObj<typeof meta> = {
  render: (args) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {countries.map((id) => (
        <PlaceSilhouette
          key={id}
          {...args}
          placeId={id}
        />
      ))}
    </View>
  ),
}
