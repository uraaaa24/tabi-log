const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const baseConfig = getDefaultConfig(__dirname)

// E2E (browser) only: the product does not ship a web build. These substitutes
// stand in for OS features that have no browser implementation, so Playwright
// can drive the real screens, routing and SQLite. Native bundles never see them.
if (process.env.TABI_E2E === '1') {
  const platformDirectory = path.join(__dirname, 'e2e', 'platform')
  const substitutes = {
    'expo-file-system': path.join(platformDirectory, 'file-system.ts'),
    'expo-sqlite': path.join(platformDirectory, 'sqlite.ts'),
    '@react-native-community/datetimepicker': path.join(
      platformDirectory,
      'DateTimePicker.tsx',
    ),
  }
  const webAlert =
    /react-native-web[\\/]dist[\\/](cjs[\\/])?exports[\\/]Alert[\\/]index\.js$/
  baseConfig.resolver.assetExts = [...baseConfig.resolver.assetExts, 'wasm']
  const resolveRequest = baseConfig.resolver.resolveRequest
  baseConfig.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform !== 'web') {
      throw new Error('TABI_E2E is only for the browser E2E build.')
    }
    // A substitute may import the real package it wraps.
    if (
      substitutes[moduleName] &&
      !context.originModulePath.startsWith(platformDirectory)
    ) {
      return { type: 'sourceFile', filePath: substitutes[moduleName] }
    }
    const resolved = (resolveRequest ?? context.resolveRequest)(
      context,
      moduleName,
      platform,
    )
    if (resolved.type === 'sourceFile' && webAlert.test(resolved.filePath)) {
      return {
        type: 'sourceFile',
        filePath: path.join(platformDirectory, 'Alert.ts'),
      }
    }
    return resolved
  }
}

const config = withNativeWind(baseConfig, {
  input: './global.css',
})

// A release must retain the product entry, even with a leftover Storybook flag.
if (
  process.env.STORYBOOK_ENABLED === 'true' &&
  process.env.NODE_ENV !== 'production'
) {
  const { withStorybook } = require('@storybook/react-native/withStorybook')
  module.exports = withStorybook(config, {
    configPath: `${__dirname}/.rnstorybook`,
    liteMode: true,
    docTools: false,
  })
} else {
  module.exports = config
}
