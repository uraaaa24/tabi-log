import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: '旅の記録',
  slug: 'tabi-log',
  scheme: 'tabilog',
  version: '0.1.0',
  orientation: 'portrait',
  ios: { bundleIdentifier: 'dev.tabilog.app' },
  android: { package: 'dev.tabilog.app' },
  userInterfaceStyle: 'light',
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-sqlite',
    '@react-native-community/datetimepicker',
    [
      'expo-image-picker',
      {
        photosPermission: '旅の記録に写真を追加するために使用します。',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
  experiments: { reactCompiler: true },
}

export default config
