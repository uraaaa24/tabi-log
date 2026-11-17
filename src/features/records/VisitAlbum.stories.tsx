import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { View } from 'react-native'

import { sampleImageUri, samplePhotos } from '../../testing/travel'
import type { Visit } from './domain/record'
import { VisitAlbum } from './VisitAlbum'

const visit: Visit = {
  id: 'album',
  placeId: 'JP-01',
  startDate: '2026-01-01',
  endDate: '2026-01-03',
  diary:
    'はじめての北海道旅行。\n雪景色の小樽運河はとてもきれいで、\n美味しい海鮮もたっぷり楽しめました。\nまたいつか、違う季節にも訪れたいです。',
  transports: ['車'],
  otherTransport: '',
  photos: samplePhotos.slice(1, 6),
  createdAt: '',
  updatedAt: '',
}
const meta = {
  title: 'Records/VisitAlbum',
  component: VisitAlbum,
  parameters: { layout: 'fullscreen' },
  args: {
    placeName: '北海道',
    visit,
    width: 390,
    uriFor: () => sampleImageUri,
    onBack: () => undefined,
    onEdit: () => undefined,
    onOpenPhoto: () => undefined,
    onOpenAll: () => undefined,
  },
  render: (args) => (
    <View style={{ width: 390, height: 844 }}>
      <VisitAlbum {...args} />
    </View>
  ),
} satisfies Meta<typeof VisitAlbum>
export default meta
export const ManyPhotos: StoryObj<typeof meta> = {}
export const TwoPhotos: StoryObj<typeof meta> = {
  args: {
    visit: {
      ...visit,
      photos: samplePhotos.slice(0, 2),
      transports: ['飛行機', '電車'],
    },
  },
}
export const Empty: StoryObj<typeof meta> = {
  args: { visit: { ...visit, photos: [], diary: '', transports: [] } },
}
