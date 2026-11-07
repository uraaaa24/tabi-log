import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { requireDisableReason } from './require-disable-reason'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('require-disable-reason', requireDisableReason, {
  valid: [
    '// oxlint-disable-next-line no-console -- command output is required\nconsole.log(1)',
    'console.log(1) // oxlint-disable-line no-console -- command output is required',
    '/* oxlint-disable no-console -- command output is required */',
    '// eslint-disable-next-line no-console -- command output is required\nconsole.log(1)',
    '// oxlint-disable-next-line no-console -- 日本語での理由も許可する\nconsole.log(1)',
    '// oxlint-enable no-console',
    'const text = "oxlint-disable no-console"',
    '// This explains oxlint-disable without disabling a rule',
  ],
  invalid: [
    {
      code: '// oxlint-disable-next-line no-console\nconsole.log(1)',
      errors: [{ messageId: 'missingReason' }],
    },
    {
      code: 'console.log(1) // oxlint-disable-line no-console',
      errors: [{ messageId: 'missingReason' }],
    },
    {
      code: '/* oxlint-disable no-console */',
      errors: [{ messageId: 'missingReason' }],
    },
    {
      code: '// oxlint-disable-next-line no-console --   \nconsole.log(1)',
      errors: [{ messageId: 'missingReason' }],
    },
    {
      code: '// eslint-disable-next-line no-console\nconsole.log(1)',
      errors: [{ messageId: 'missingReason' }],
    },
    { code: '// oxlint-disable', errors: [{ messageId: 'missingReason' }] },
  ],
})
