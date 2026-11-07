import type { Meta, StoryObj } from '@storybook/react-native-web-vite'

import { VisitSheet } from './VisitSheet'

const meta = {
  title: 'Records/VisitSheet',
  component: VisitSheet,
  args: {
    visible: true,
    selected: 'visit-0',
    visits: Array.from({ length: 8 }, (_value, index) => ({
      id: `visit-${index}`,
      startDate: `${2026 - index}-10-18`,
      endDate: `${2026 - index}-10-19`,
    })),
    onClose: () => undefined,
    onSelect: () => undefined,
    onAdd: () => undefined,
    onRemovePlace: () => undefined,
  },
} satisfies Meta<typeof VisitSheet>
export default meta
export const History: StoryObj<typeof meta> = {}
