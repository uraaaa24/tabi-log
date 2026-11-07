import { LiteUI } from '@storybook/react-native-ui-lite'
import { registerRootComponent } from 'expo'

import '../global.css'
import { view } from './storybook.requires'

const NativeStorybook = view.getStorybookUI({
  CustomUIComponent: LiteUI,
  shouldPersistSelection: false,
})

registerRootComponent(NativeStorybook)
