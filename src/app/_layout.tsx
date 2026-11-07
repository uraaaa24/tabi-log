import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { StoreProvider } from '../storage/StoreProvider'
import '../../global.css'

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2e6cf' }}>
          <StoreProvider>
            <Stack
              screenOptions={{ headerShown: false, gestureEnabled: false }}
            />
          </StoreProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
