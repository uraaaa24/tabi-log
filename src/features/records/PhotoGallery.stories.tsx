import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { sampleImageUri, samplePhotos } from '../../testing/travel'
import { PhotoGallery } from './PhotoGallery'

const meta = {
  title: 'Records/PhotoGallery',
  component: PhotoGallery,
  args: {
    photos: samplePhotos,
    uriFor: () => sampleImageUri,
    onSelect: () => undefined,
  },
  decorators: [
    (Story) => (
      <View style={{ width: 390, height: 700, backgroundColor: '#fcf5e5' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PhotoGallery>
export default meta
export const Mixed: StoryObj<typeof meta> = {}
export const Many: StoryObj<typeof meta> = {
  args: {
    photos: Array.from({ length: 2000 }, (_value, index) => ({
      ...samplePhotos[index % samplePhotos.length],
      id: `large-${index}`,
    })) as typeof samplePhotos,
  },
}
