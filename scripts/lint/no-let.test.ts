import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { noLet } from './no-let'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('no-let', noLet, {
  valid: [
    'const title = "旅"',
    'for (const photo of photos) { use(photo) }',
    'const label = "let is text"',
    '// let is a comment\nconst count = 0',
    'const object = { let: 1 }',
  ],
  invalid: [
    { code: 'let count = 0', errors: [{ messageId: 'preferConst' }] },
    { code: 'let value; value = 1', errors: [{ messageId: 'preferConst' }] },
    {
      code: 'for (let i = 0; i < 3; i++) { use(i) }',
      errors: [{ messageId: 'preferConst' }],
    },
    {
      code: 'for (let photo of photos) { use(photo) }',
      errors: [{ messageId: 'preferConst' }],
    },
    { code: 'let { title } = visit', errors: [{ messageId: 'preferConst' }] },
  ],
})
