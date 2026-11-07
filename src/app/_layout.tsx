import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import { colors } from '../components/TravelUI'
import { StoreProvider } from '../storage/StoreProvider'
import '../../global.css'

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StoreProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor: colors.background },
              }}
            />
          </StoreProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
