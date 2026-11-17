import type { StorybookConfig } from '@storybook/react-native-web-vite'
import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { mergeConfig } from 'vite'

const config = {
  stories: ['../src/**/*.stories.tsx'],
  // SDK 58のSVGはこの名前でアセットを読む。ViteではRN Webと同じレジストリを使う。
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      // 開発サーバーの事前変換（esbuild）は、react-native-svgがAndroidで
      // requireするTurboModuleの未定義exportをエラーにする。静的ビルドと同様に
      // 実行されない経路として、空の実装へ解決する。
      optimizeDeps: {
        esbuildOptions: {
          plugins: [
            {
              name: 'react-native-svg-sound-module',
              setup: (build: {
                onResolve: (
                  options: { filter: RegExp },
                  callback: () => { path: string },
                ) => void
              }) => {
                build.onResolve(
                  { filter: /fabric\/NativeSvgSoundModule$/ },
                  () => ({
                    path: fileURLToPath(
                      new URL('./svg-sound.ts', import.meta.url),
                    ),
                  }),
                )
              },
            },
          ],
        },
      },
      resolve: {
        alias: {
          '@react-native-community/datetimepicker': fileURLToPath(
            new URL('./DateTimePicker.tsx', import.meta.url),
          ),
          // expo-modules-coreを使うOS部品はブラウザ用の同じAPIに差し替える。
          'expo-font': fileURLToPath(
            new URL('./expo-font.ts', import.meta.url),
          ),
          ...Object.fromEntries(
            ['500Medium', '700Bold'].map((weight) => [
              `@expo-google-fonts/shippori-mincho/${weight}`,
              fileURLToPath(new URL('./shippori-mincho.ts', import.meta.url)),
            ]),
          ),
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
