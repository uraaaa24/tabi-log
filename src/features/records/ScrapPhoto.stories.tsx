import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { Paper } from '../../components/TravelUI'
import { sampleImageUri, samplePhotos } from '../../testing/travel'
import { ScrapPhoto } from './ScrapPhoto'

const photo = samplePhotos[0]
if (!photo) {
  throw new Error('サンプル写真がありません。')
}
const meta = {
  title: 'Records/ScrapPhoto',
  component: ScrapPhoto,
  args: { photo, uri: sampleImageUri, number: 1, onPress: () => undefined },
  decorators: [
    (Story) => (
      <View style={{ width: 360 }}>
        <Paper>
          <Story />
        </Paper>
      </View>
    ),
  ],
} satisfies Meta<typeof ScrapPhoto>
export default meta
export const Portrait: StoryObj<typeof meta> = {}
export const Landscape: StoryObj<typeof meta> = {
  args: { photo: samplePhotos[1] },
}
