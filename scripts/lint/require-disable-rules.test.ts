import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { requireDisableRules } from './require-disable-rules'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('require-disable-rules', requireDisableRules, {
  valid: [
    '// oxlint-disable-next-line no-console -- required output\nconsole.log(1)',
    '// oxlint-disable-next-line no-console, no-alert -- required output\nconsole.log(1)',
    '/* oxlint-disable no-console -- required output */',
    '// eslint-disable-next-line no-console -- required output\nconsole.log(1)',
    '// oxlint-enable',
    'const text = "oxlint-disable -- not a directive"',
  ],
  invalid: [
    {
      code: '// oxlint-disable-next-line -- required exception\nconsole.log(1)',
      errors: [{ messageId: 'missingRules' }],
    },
    {
      code: 'console.log(1) // oxlint-disable-line -- required exception',
      errors: [{ messageId: 'missingRules' }],
    },
    {
      code: '/* oxlint-disable -- required exception */',
      errors: [{ messageId: 'missingRules' }],
    },
    {
      code: '// eslint-disable-next-line -- required exception\nconsole.log(1)',
      errors: [{ messageId: 'missingRules' }],
    },
    { code: '// oxlint-disable', errors: [{ messageId: 'missingRules' }] },
    {
      code: '// oxlint-disable-next-line , , -- required exception',
      errors: [{ messageId: 'missingRules' }],
    },
  ],
})
