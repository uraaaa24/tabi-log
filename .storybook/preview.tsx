import type { Preview } from '@storybook/react-native-web-vite'

import { FontGate } from '../src/components/Fonts'
import '../global.css'

const preview: Preview = {
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <FontGate>
        <Story />
      </FontGate>
    ),
  ],
}

export default preview
