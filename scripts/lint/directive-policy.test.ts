import { describe, expect, it } from 'vitest'

import { inspectDirectiveComments } from './directive-policy'

describe('suppression preflight cannot be disabled by source directives', () => {
  it.each([
    '// oxlint-disable-next-line -- reason\nconsole.log(1)',
    'console.log(1) // oxlint-disable-line -- reason',
    '/* oxlint-disable -- reason */\nconsole.log(1)',
    '/* eslint-disable -- reason */\nconsole.log(1)',
    'function f() { /* oxlint-disable -- reason */ }',
    '// oxlint-disable-next-line no-console\nconsole.log(1)',
    '/* oxlint-disable-next-line tabi-log/require-disable-rules -- reason */\n// oxlint-disable-next-line -- reason\nconsole.log(1)',
  ])('rejects invalid directives: %s', (source) => {
    expect(
      inspectDirectiveComments(source, 'probe.tsx').length,
    ).toBeGreaterThan(0)
  })
  it.each([
    '// oxlint-disable-next-line no-console -- output is necessary\nconsole.log(1)',
    'const text = "// oxlint-disable -- reason"',
    'const text = `/* oxlint-disable -- reason */`',
    'const element = <Text>// oxlint-disable -- text</Text>',
    'const element = <Text>{/* oxlint-disable no-console -- reason */}</Text>',
    '// oxlint-enable',
  ])('accepts valid directives and non-comments: %s', (source) => {
    expect(inspectDirectiveComments(source, 'probe.tsx')).toEqual([])
  })
})
