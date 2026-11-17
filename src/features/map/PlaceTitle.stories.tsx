import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { colors } from '../../components/TravelUI'
import { PlaceTitle } from './PlaceTitle'

const meta = {
  title: 'Map/PlaceTitle',
  component: PlaceTitle,
  args: { placeId: 'JP-20', size: 140, pinned: true },
  decorators: [
    (Story) => (
      <View
        style={{ width: 390, padding: 24, backgroundColor: colors.surface }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PlaceTitle>
export default meta
export const Prefecture: StoryObj<typeof meta> = {}
export const Country: StoryObj<typeof meta> = { args: { placeId: 'FR' } }
export const LongName: StoryObj<typeof meta> = {
  args: { placeId: 'VC', size: 112, pinned: false },
}
export const SmallCountry: StoryObj<typeof meta> = {
  args: { placeId: 'VA', size: 112, pinned: false },
}
