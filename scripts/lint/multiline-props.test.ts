import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { multilineProps } from './multiline-props'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('multiline-props', multilineProps, {
  valid: [
    'type Props = Readonly<{\n  title: string\n  diary: string\n}>',
    'type Props = Readonly<{\n  title: string\n}>',
    'type ListProps<T> = Readonly<{\n  items: readonly T[]\n}>',
    'type Props = Readonly<BaseProps>',
    'type Props = Readonly<{}>',
    'type Visit = { title: string; diary: string }',
  ],
  invalid: [
    {
      code: 'type Props = Readonly<{title:string;diary:string}>',
      output: 'type Props = Readonly<{\ntitle:string;\ndiary:string\n}>',
      errors: [{ messageId: 'multiline' }],
    },
    {
      code: 'type CardProps = Readonly<{title:string}>',
      output: 'type CardProps = Readonly<{\ntitle:string\n}>',
      errors: [{ messageId: 'multiline' }],
    },
    {
      code: 'type Props = Readonly<{\ntitle:string;diary:string\n}>',
      output: 'type Props = Readonly<{\ntitle:string;\ndiary:string\n}>',
      errors: [{ messageId: 'multiline' }],
    },
    {
      code: 'type Props = {title:string}',
      output: 'type Props = {\ntitle:string\n}',
      errors: [{ messageId: 'multiline' }],
    },
    {
      code: 'type Props = Readonly<{\ntitle:string}>',
      output: 'type Props = Readonly<{\ntitle:string\n}>',
      errors: [{ messageId: 'multiline' }],
    },
    {
      code: 'type Props = Readonly<{/* title */ title:string}>',
      output: 'type Props = Readonly<{/* title */ \ntitle:string\n}>',
      errors: [{ messageId: 'multiline' }],
    },
  ],
})
