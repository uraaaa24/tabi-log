import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { sampleImageUri } from '../../testing/travel'
import { PlaceTimeline } from './PlaceTimeline'

const meta = {
  title: 'Records/PlaceTimeline',
  component: PlaceTimeline,
  parameters: { layout: 'fullscreen' },
  args: {
    placeId: 'JP-01',
    placeName: '北海道',
    visits: [
      {
        id: 'a',
        startDate: '2026-01-01',
        endDate: '2026-01-03',
        photoCount: 5,
        uri: sampleImageUri,
      },
      {
        id: 'b',
        startDate: '2025-04-05',
        endDate: '2025-04-06',
        photoCount: 2,
        uri: sampleImageUri,
      },
      {
        id: 'c',
        startDate: '2024-12-30',
        endDate: '2025-01-02',
        photoCount: 0,
        uri: null,
      },
      {
        id: 'd',
        startDate: '2023-10-12',
        endDate: '2023-10-12',
        photoCount: 1,
        uri: sampleImageUri,
      },
    ],
    onBack: () => undefined,
    onOpen: () => undefined,
    onAdd: () => undefined,
    onRemovePlace: () => undefined,
  },
  render: (args) => (
    <View style={{ width: 390, height: 844 }}>
      <PlaceTimeline {...args} />
    </View>
  ),
} satisfies Meta<typeof PlaceTimeline>
export default meta
export const Years: StoryObj<typeof meta> = {}
export const PinOnly: StoryObj<typeof meta> = { args: { visits: [] } }
