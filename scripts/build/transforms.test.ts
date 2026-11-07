import { transformFileSync } from '@babel/core'
import path from 'node:path'
import { build } from 'vite'
import { rnw } from 'vite-plugin-rnw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import storybook from '../../.storybook/main'

const root = process.cwd()
const component = path.join(root, 'src/components/PaperCard.tsx')
const metroCaller = {
  name: 'metro',
  bundler: 'metro',
  platform: 'android',
  isDev: false,
  isServer: false,
  supportsStaticESM: true,
  supportsReactCompiler: true,
}

async function compileStorybook(file: string) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [rnw(storybook.framework.options.pluginReactOptions)],
    build: {
      write: false,
      minify: false,
      lib: { entry: file, formats: ['es'] },
      rollupOptions: {
        external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      },
    },
  })
  const outputs = Array.isArray(result) ? result : [result]
  return outputs
    .flatMap((output) => ('output' in output ? output.output : []))
    .flatMap((output) => (output.type === 'chunk' ? [output.code] : []))
    .join('\n')
}

afterEach(() => vi.unstubAllEnvs())

describe('shared component build transforms', () => {
  it.each(['android', 'ios'])(
    'compiles NativeWind and React Compiler for Metro (%s)',
    (platform) => {
      const caller = { ...metroCaller, platform }
      const result = transformFileSync(component, { caller })
      expect(result?.code).toContain('react/compiler-runtime')
      expect(result?.code).toContain('react.memo_cache_sentinel')
      expect(result?.code).toContain('react-native-css-interop')
      expect(result?.code).not.toContain('<View')
    },
  )

  it('keeps the Worklets transform alongside the compiler and NativeWind', () => {
    const result = transformFileSync(
      path.join(root, 'scripts/fixtures/worklet.ts'),
      {
        caller: metroCaller,
      },
    )
    expect(result?.code).toContain('__workletHash')
    expect(result?.code).not.toContain('value: number')
  })

  it.each(['development', 'production'])(
    'compiles the shared component with Storybook Vite (%s)',
    async (mode) => {
      vi.stubEnv('NODE_ENV', mode)
      const code = await compileStorybook(component)
      expect(code).toContain('react/compiler-runtime')
      expect(code).toContain('react.memo_cache_sentinel')
      expect(code).toContain(
        mode === 'production'
          ? 'nativewind/jsx-runtime'
          : 'nativewind/jsx-dev-runtime',
      )
      expect(code).toContain('bg-paper')
      expect(code).not.toContain('<View')
    },
  )
  it('transforms Worklets in Storybook with the compiler configured first', async () => {
    const code = await compileStorybook(
      path.join(root, 'scripts/fixtures/worklet.ts'),
    )
    expect(code).toContain('__workletHash')
    expect(code).not.toContain('value: number')
  })
})
