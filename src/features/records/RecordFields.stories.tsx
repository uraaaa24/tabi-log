import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { Button, colors, Header } from '../../components/TravelUI'
import { sampleImageUri, samplePhotos } from '../../testing/travel'
import type { Visit } from './domain/record'
import { RecordFields } from './RecordFields'

const sample: Visit = {
  id: 'story',
  placeId: 'JP-20',
  startDate: '2026-10-18',
  endDate: '2026-10-18',
  createdAt: '',
  updatedAt: '',
  diary: '高原を歩いて、帰りに小さな喫茶店へ。',
  otherTransport: '',
  transports: ['電車', '徒歩'],
  photos: samplePhotos.slice(0, 2),
}
const FormExample = () => {
  const [draft, setDraft] = useState(sample)
  const [multipleDays, setMultipleDays] = useState(false)
  return (
    <View
      style={{ width: 390, height: 780, backgroundColor: colors.background }}
    >
      <Header
        title="長野県"
        onBack={() => undefined}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <RecordFields
          draft={draft}
          onChange={setDraft}
          multipleDays={multipleDays}
          onMultipleDaysChange={setMultipleDays}
          uriFor={() => sampleImageUri}
          onAddPhotos={() => undefined}
        />
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: colors.surface,
        }}
      >
        <Button
          label="旅の記録を保存"
          onPress={() => undefined}
        />
      </View>
    </View>
  )
}
const meta = { title: 'Records/Form', component: FormExample } satisfies Meta<
  typeof FormExample
>
export default meta
export const Editing: StoryObj<typeof meta> = {}
