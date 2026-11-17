import { LiteUI } from '@storybook/react-native-ui-lite'
import { registerRootComponent } from 'expo'
import { createElement } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import '../global.css'
import { view } from './storybook.requires'

const NativeStorybook = view.getStorybookUI({
  CustomUIComponent: LiteUI,
  shouldPersistSelection: false,
  // Open the same card every time; otherwise the alphabetically first story
  // opens and changes as stories are added. The Android smoke check expects it.
  initialSelection: { kind: 'Components/PaperCard', name: 'Default' },
})

const StorybookRoot = () => {
  return createElement(
    GestureHandlerRootView,
    { style: { flex: 1 } },
    createElement(NativeStorybook),
  )
}

registerRootComponent(StorybookRoot)
