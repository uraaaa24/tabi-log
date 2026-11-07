import { Stack, usePathname } from 'expo-router'
import { StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '../components/TravelUI'
import { StoreProvider } from '../storage/StoreProvider'
import '../../global.css'

const RootLayout = () => {
  const onMap = usePathname() === '/'
  const backgroundColor = onMap ? colors.board : colors.background
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle={onMap ? 'light-content' : 'dark-content'} />
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          <StoreProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor },
              }}
            />
          </StoreProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
