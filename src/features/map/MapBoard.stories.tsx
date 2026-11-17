import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { sampleImageUri } from '../../testing/travel'
import prefectures from './domain/prefectures.json'
import { MapBoard } from './MapBoard'

const meta = {
  title: 'Map/Board',
  component: MapBoard,
  parameters: { layout: 'fullscreen' },
  args: {
    visited: ['JP-01', 'JP-04', 'JP-19', 'JP-26', 'JP-44', 'JP-47'],
    photos: {
      'JP-01': sampleImageUri,
      'JP-04': sampleImageUri,
      'JP-19': sampleImageUri,
      'JP-26': sampleImageUri,
      'JP-44': sampleImageUri,
    },
    onSelect: () => undefined,
    onSettings: () => undefined,
    onReload: () => undefined,
  },
  render: (args) => (
    <GestureHandlerRootView style={{ width: 390, height: 784 }}>
      <MapBoard {...args} />
    </GestureHandlerRootView>
  ),
} satisfies Meta<typeof MapBoard>
export default meta
export const WithPins: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { visited: [] } }
export const SmallPhone: StoryObj<typeof meta> = {
  render: (args) => (
    <GestureHandlerRootView style={{ width: 320, height: 568 }}>
      <MapBoard {...args} />
    </GestureHandlerRootView>
  ),
}
export const ReadError: StoryObj<typeof meta> = {
  args: {
    visited: null,
    error: '記録を読み込めませんでした。もう一度お試しください。',
  },
}
export const Loading: StoryObj<typeof meta> = {
  args: { visited: null, loading: true },
}

export const AllVisited: StoryObj<typeof meta> = {
  args: { visited: prefectures.map((place) => place.id) },
}
