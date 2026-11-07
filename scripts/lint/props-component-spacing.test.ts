import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { propsComponentSpacing } from './props-component-spacing'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('props-component-spacing', propsComponentSpacing, {
  valid: [
    'type CardProps = Readonly<{}>\n\nexport const Card = () => <View />',
    'type Props = Readonly<{}>\n\n/** Card documentation */\nconst Card = () => <View />',
    'type Props = Readonly<{}>',
    'type Visit = { title: string }\nconst title = "title"',
    'type Props = Readonly<{}>\nconst helper = () => 1',
  ],
  invalid: [
    {
      code: 'type CardProps = Readonly<{}>\nexport const Card = () => <View />',
      output:
        'type CardProps = Readonly<{}>\n\nexport const Card = () => <View />',
      errors: [{ messageId: 'blankLine' }],
    },
    {
      code: 'export type CardProps = Readonly<{}>\nexport const Card = () => <View />',
      output:
        'export type CardProps = Readonly<{}>\n\nexport const Card = () => <View />',
      errors: [{ messageId: 'blankLine' }],
    },
    {
      code: 'type Props = Readonly<{}>; const Card = () => <View />',
      output: 'type Props = Readonly<{}>; \n\nconst Card = () => <View />',
      errors: [{ messageId: 'blankLine' }],
    },
    {
      code: 'type Props = Readonly<{}>\n/** Card documentation */\nconst Card = () => <View />',
      output:
        'type Props = Readonly<{}>\n\n/** Card documentation */\nconst Card = () => <View />',
      errors: [{ messageId: 'blankLine' }],
    },
    {
      code: 'type Props = Readonly<{}>\n// Card documentation\nexport const Card = () => <View />',
      output:
        'type Props = Readonly<{}>\n\n// Card documentation\nexport const Card = () => <View />',
      errors: [{ messageId: 'blankLine' }],
    },
  ],
})
