import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import type { BundleMode } from './build/bundle-sources.ts'
import { checkBundleSources } from './build/bundle-sources.ts'

for (const mode of ['product', 'storybook'] satisfies BundleMode[]) {
  const output = path.resolve('dist/bundle-checks', mode)
  const development = mode === 'storybook'
  const result = spawnSync(
    process.execPath,
    [
      path.resolve('node_modules/expo/bin/cli'),
      'export',
      '--platform',
      'android',
      '--platform',
      'ios',
      '--source-maps',
      '--no-bytecode',
      '--no-minify',
      '--max-workers',
      '2',
      '--output-dir',
      output,
      ...(development ? ['--dev'] : []),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: development ? 'development' : 'production',
        // Deliberately enabled for BOTH exports: production must still be safe.
        STORYBOOK_ENABLED: 'true',
        STORYBOOK_SERVER: 'false',
        STORYBOOK_DISABLE_TELEMETRY: '1',
        EXPO_NO_TELEMETRY: '1',
        EXPO_UNSTABLE_HEADLESS: '1',
      },
    },
  )
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
  for (const platform of ['android', 'ios']) {
    const directory = path.join(output, '_expo/static/js', platform)
    const maps = (await readdir(directory)).filter((file) =>
      file.endsWith('.map'),
    )
    assert.ok(
      maps.length > 0,
      `${mode}/${platform}: no source maps were produced`,
    )
    for (const file of maps) {
      const map: { sources: string[] } = JSON.parse(
        await readFile(path.join(directory, file), 'utf8'),
      )
      assert.ok(Array.isArray(map.sources), `${file}: invalid source map`)
      assert.deepEqual(
        checkBundleSources(map.sources, mode),
        [],
        `${mode}/${platform}: incorrect entry graph`,
      )
    }
    console.log(`${mode}/${platform}: entry graph and bundle boundaries passed`)
  }
}
