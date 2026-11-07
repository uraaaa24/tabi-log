import type { StorybookConfig } from '@storybook/react-native-web-vite'
import { createRequire } from 'node:module'
import { mergeConfig } from 'vite'

const config = {
  stories: ['../src/**/*.stories.tsx'],
  // SDK 58のSVGはこの名前でアセットを読む。ViteではRN Webと同じレジストリを使う。
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@react-native/assets-registry/registry': createRequire(
            import.meta.url,
          ).resolve('react-native-web/dist/modules/AssetRegistry/index.js'),
        },
      },
    }),
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
