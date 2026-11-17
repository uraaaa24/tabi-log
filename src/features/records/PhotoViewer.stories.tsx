import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { sampleImageUri, samplePhotos } from '../../testing/travel'
import { PhotoViewer } from './PhotoViewer'

const meta = {
  title: 'Records/PhotoViewer',
  component: PhotoViewer,
  parameters: { layout: 'fullscreen' },
  args: {
    photos: samplePhotos.slice(0, 4),
    index: 0,
    width: 390,
    height: 844,
    uriFor: () => sampleImageUri,
    onClose: () => undefined,
  },
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Story />
      </SafeAreaProvider>
    ),
  ],
} satisfies Meta<typeof PhotoViewer>
export default meta
export const FirstOfFour: StoryObj<typeof meta> = {}
