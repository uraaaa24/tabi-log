const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = withNativeWind(getDefaultConfig(__dirname), {
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
