import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { closeSync, openSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

import { paperCardExamples } from '../src/testing/paper-card.ts'

const artifacts = path.resolve('dist/android-smoke')
await mkdir(artifacts, { recursive: true })

function adb(args: string[]) {
  const result = spawnSync('adb', args, { encoding: 'utf8', timeout: 30_000 })
  assert.equal(
    result.status,
    0,
    `adb ${args.join(' ')}: ${result.error?.message ?? result.stderr}`,
  )
  return result.stdout
}

adb(['wait-for-device'])
adb(['install', '-r', 'android/app/build/outputs/apk/debug/app-debug.apk'])

for (const [mode, port] of [
  ['product', 8081],
  ['storybook', 8082],
] as const) {
  const base = `http://127.0.0.1:${port}`
  const occupied = await fetch(`${base}/status`, {
    signal: AbortSignal.timeout(1000),
  })
    .then(() => true)
    .catch(() => false)
  assert.equal(
    occupied,
    false,
    `Port ${port} is in use; stop your own Metro server first`,
  )
  const log = openSync(path.join(artifacts, `${mode}-metro.log`), 'w')
  const server = spawn(
    process.execPath,
    [
      path.resolve('node_modules/expo/bin/cli'),
      'start',
      '--dev-client',
      '--offline',
      '--port',
      String(port),
      '--max-workers',
      '2',
    ],
    {
      detached: process.platform !== 'win32',
      stdio: ['ignore', log, log],
      env: {
        ...process.env,
        CI: '1',
        NODE_ENV: 'development',
        STORYBOOK_ENABLED: String(mode === 'storybook'),
        STORYBOOK_SERVER: 'false',
        STORYBOOK_DISABLE_TELEMETRY: '1',
        EXPO_NO_TELEMETRY: '1',
        EXPO_UNSTABLE_HEADLESS: '1',
      },
    },
  )
  closeSync(log)
  try {
    const deadline = Date.now() + 180_000
    while (true) {
      assert.equal(
        server.exitCode,
        null,
        `Metro exited; inspect ${mode}-metro.log`,
      )
      const ready = await fetch(`${base}/status`, {
        signal: AbortSignal.timeout(2000),
      })
        .then(
          async (response) =>
            response.ok && (await response.text()).includes('running'),
        )
        .catch(() => false)
      if (ready) {
        break
      }
      assert.ok(Date.now() < deadline, `Metro did not become ready: ${mode}`)
      await delay(1000)
    }
    adb(['reverse', `tcp:${port}`, `tcp:${port}`])
    adb(['shell', 'am', 'force-stop', 'dev.tabilog.app'])
    adb([
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-d',
      `tabilog://expo-development-client/?url=${encodeURIComponent(base)}`,
      'dev.tabilog.app',
    ])
    const visibleDeadline = Date.now() + 180_000
    while (true) {
      const dump = spawnSync(
        'adb',
        ['shell', 'uiautomator', 'dump', '/sdcard/tabi-window.xml'],
        { encoding: 'utf8', timeout: 15_000 },
      )
      if (dump.status === 0) {
        const xml = adb(['exec-out', 'cat', '/sdcard/tabi-window.xml'])
        await writeFile(path.join(artifacts, `${mode}.xml`), xml)
        if (
          xml.includes(paperCardExamples.default.title) &&
          xml.includes(paperCardExamples.default.description)
        ) {
          break
        }
      }
      assert.ok(
        Date.now() < visibleDeadline,
        `${mode}: shared PaperCard text was not visible; inspect screenshots, XML and logs`,
      )
      await delay(2000)
    }
    console.log(`${mode}: shared PaperCard rendered on Android`)
  } finally {
    const screenshot = spawnSync('adb', ['exec-out', 'screencap', '-p'], {
      timeout: 15_000,
    })
    if (screenshot.status === 0) {
      await writeFile(path.join(artifacts, `${mode}.png`), screenshot.stdout)
    }
    const logs = spawnSync('adb', ['logcat', '-d', '-t', '500'], {
      timeout: 15_000,
    })
    if (logs.status === 0) {
      await writeFile(path.join(artifacts, `${mode}-logcat.txt`), logs.stdout)
    }
    if (server.pid && server.exitCode === null) {
      if (process.platform === 'win32') {
        server.kill('SIGTERM')
      } else {
        process.kill(-server.pid, 'SIGTERM')
      }
    }
    spawnSync('adb', ['reverse', '--remove', `tcp:${port}`], {
      timeout: 10_000,
    })
  }
}
