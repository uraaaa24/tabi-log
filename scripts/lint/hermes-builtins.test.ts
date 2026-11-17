import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { hermesBuiltins } from './hermes-builtins'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('hermes-builtins', hermesBuiltins, {
  valid: [
    'const sorted = [...places].sort((a, b) => a.y - b.y)',
    'const reversed = [...tear].reverse()',
    'const last = photos.at(-1)',
    'const visit = { toSorted: true }',
    'const groups = Object.entries(visits)',
    'const name = "toSorted"',
  ],
  invalid: [
    {
      code: 'const sorted = places.toSorted((a, b) => a.y - b.y)',
      errors: [{ messageId: 'unsupported' }],
    },
    {
      code: 'const reversed = tear.toReversed()',
      errors: [{ messageId: 'unsupported' }],
    },
    {
      code: 'const last = photos.findLast((photo) => photo.ok)',
      errors: [{ messageId: 'unsupported' }],
    },
    {
      code: 'const byYear = Object.groupBy(visits, visitYear)',
      errors: [{ messageId: 'unsupported' }],
    },
    {
      code: 'const { promise } = Promise.withResolvers()',
      errors: [{ messageId: 'unsupported' }],
    },
    {
      code: 'const copy = structuredClone(draft)',
      errors: [{ messageId: 'unsupported' }],
    },
  ],
})
