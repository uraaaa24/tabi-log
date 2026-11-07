import { LiteUI } from '@storybook/react-native-ui-lite'
import { registerRootComponent } from 'expo'
import { createElement } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import '../global.css'
import { view } from './storybook.requires'

const NativeStorybook = view.getStorybookUI({
  CustomUIComponent: LiteUI,
  shouldPersistSelection: false,
})

const StorybookRoot = () => {
  return createElement(
    GestureHandlerRootView,
    { style: { flex: 1 } },
    createElement(NativeStorybook),
  )
}

registerRootComponent(StorybookRoot)
