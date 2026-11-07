import type { StorybookConfig } from '@storybook/react-native-web-vite'

const config = {
  stories: ['../src/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      pluginReactOptions: {
        jsxImportSource: 'nativewind',
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', { target: '19' }],
            'react-native-worklets/plugin',
          ],
        },
      },
    },
  },
} satisfies StorybookConfig

export default config
