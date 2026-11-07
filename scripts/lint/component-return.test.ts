import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { componentReturn } from './component-return'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run('component-return', componentReturn, {
  valid: [
    'const Card = () => { return <View /> }',
    'const Card = () => { return null }',
    'export const Card = () => { return <><View /></> }',
    'const Card = () => { if (hidden) { return null } return <View /> }',
    'const Card = memo(() => { return <View /> })',
    'const Card = React.memo(() => { return <View /> })',
    'const Card = forwardRef((props, ref) => { return <View ref={ref} /> })',
    'export default () => { return <View /> }',
    'const Card = (() => { return <View /> }) satisfies Component',
    'const getTitle = () => "title"',
    'const renderItem = () => <View />',
    'photos.map((photo) => photo.id)',
    'const Items = photos.map((photo) => <View key={photo.id} />)',
    'const Card = memo(Original, (previous, next) => previous.id === next.id)',
    'const Card = () => { const render = () => <View />; return render() }',
  ],
  invalid: [
    {
      code: 'const Card = () => <View />',
      output: 'const Card = () => { return (<View />) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'export const Card = () => (<View />)',
      output: 'export const Card = () => { return ((<View />)) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = () => null',
      output: 'const Card = () => { return (null) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = () => <><View /></>',
      output: 'const Card = () => { return (<><View /></>) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = memo(() => <View />)',
      output: 'const Card = memo(() => { return (<View />) })',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = React.memo(() => <View />)',
      output: 'const Card = React.memo(() => { return (<View />) })',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = forwardRef((props, ref) => <View ref={ref} />)',
      output:
        'const Card = forwardRef((props, ref) => { return (<View ref={ref} />) })',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = React.forwardRef((props, ref) => <View ref={ref} />)',
      output:
        'const Card = React.forwardRef((props, ref) => { return (<View ref={ref} />) })',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'export default () => <View />',
      output: 'export default () => { return (<View />) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = (() => <View />) satisfies Component',
      output: 'const Card = (() => { return (<View />) }) satisfies Component',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = () => (/* keep this comment */ <View />)',
      output:
        'const Card = () => { return ((/* keep this comment */ <View />)) }',
      errors: [{ messageId: 'explicitReturn' }],
    },
    {
      code: 'const Card = () => { const render = () => { return <View /> }; render() }',
      output: null,
      errors: [{ messageId: 'missingReturn' }],
    },
    {
      code: 'const Card = () => { function render() { return <View /> } render() }',
      output: null,
      errors: [{ messageId: 'missingReturn' }],
    },
    {
      code: 'const Card = () => {}',
      output: null,
      errors: [{ messageId: 'missingReturn' }],
    },
  ],
})
