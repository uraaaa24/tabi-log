import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { readonlyProps } from './readonly-props'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('readonly-props', readonlyProps, {
  valid: [
    'type Props = Readonly<{ title: string }>',
    'type PaperCardProps = Readonly<{ title: string; diary: string }>',
    'type ListProps<T> = Readonly<{ items: readonly T[] }>',
    'type CardProps = Readonly<BaseProps & { title: string }>',
    'type CardProps = Readonly<OtherProps>',
    'type Visit = { title: string }',
    'type PropsFactory = () => string',
  ],
  invalid: [
    {
      code: 'type Props = { title: string }',
      errors: [{ messageId: 'requireReadonly' }],
    },
    {
      code: 'type PaperCardProps = { title: string; diary: string }',
      errors: [{ messageId: 'requireReadonly' }],
    },
    {
      code: 'type ListProps<T> = { items: readonly T[] }',
      errors: [{ messageId: 'requireReadonly' }],
    },
    {
      code: 'type CardProps = Readonly<BaseProps> & { title: string }',
      errors: [{ messageId: 'requireReadonly' }],
    },
    {
      code: 'type CardProps = { readonly title: string }',
      errors: [{ messageId: 'requireReadonly' }],
    },
    {
      code: 'type CardProps = OtherProps',
      errors: [{ messageId: 'requireReadonly' }],
    },
  ],
})
