import type { Meta, StoryObj } from '@storybook/react-native-web-vite'
import { useState } from 'react'
import { ScrollView } from 'react-native'

import { Surface } from '../../components/Surface'
import { sampleImageUri, samplePhotos } from '../../testing/travel'
import type { Visit } from './domain/record'
import { RecordFields } from './RecordFields'

const sample: Visit = {
  id: 'story',
  placeId: 'JP-20',
  startDate: '2026-10-18',
  endDate: '2026-10-20',
  createdAt: '',
  updatedAt: '',
  diary: '高原を歩いて、帰りに小さな喫茶店へ。',
  otherTransport: '',
  transports: ['車', '飛行機'],
  photos: samplePhotos.slice(0, 3),
}
const FormExample = () => {
  const [draft, setDraft] = useState(sample)
  return (
    <Surface
      kind="paper"
      style={{ width: 390, height: 780 }}
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <RecordFields
          draft={draft}
          onChange={setDraft}
          uriFor={() => sampleImageUri}
          onAddPhotos={() => undefined}
        />
      </ScrollView>
    </Surface>
  )
}
const meta = { title: 'Records/Form', component: FormExample } satisfies Meta<
  typeof FormExample
>
export default meta
export const Editing: StoryObj<typeof meta> = {}
