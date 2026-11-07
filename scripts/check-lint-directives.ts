import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

import { inspectDirectiveComments } from './lint/directive-policy.ts'

const requested = process.argv.slice(2)
const files =
  requested.length > 0
    ? requested
    : execFileSync(
        'git',
        ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        { encoding: 'utf8' },
      )
        .split('\0')
        .filter(Boolean)
const targets = files.filter(
  (file) =>
    /\.[cm]?[jt]sx?$/u.test(file) &&
    !/^(docs\/mockups|node_modules|dist|storybook-static|ios|android)\//u.test(
      file,
    ),
)
const problems = (
  await Promise.all(
    targets.map(async (file) =>
      inspectDirectiveComments(await readFile(file, 'utf8'), file),
    ),
  )
).flat()
if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exitCode = 1
} else {
  console.log('Lint suppression directives passed.')
}
