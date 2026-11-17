import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

// ES2023+ built-ins that Hermes (React Native's engine) does not implement.
// TypeScript's ES2023 lib accepts them, and they work in the browser builds
// (Storybook, E2E), so without this check they only fail on the device with
// "undefined is not a function" while the module loads.
const arrayMethods = new Set([
  'toSorted',
  'toReversed',
  'toSpliced',
  'findLast',
  'findLastIndex',
])
const staticMethods = new Map([
  ['Object', new Set(['groupBy'])],
  ['Map', new Set(['groupBy'])],
  ['Promise', new Set(['withResolvers'])],
])

export const hermesBuiltins: Rule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      unsupported:
        '{{name}} is not available in Hermes on the device; use an equivalent such as copying the array before sort/reverse.',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (node.computed || node.property.type !== 'Identifier') {
          return
        }
        const name = node.property.name
        const owner =
          node.object.type === 'Identifier' ? node.object.name : undefined
        const unsupported = owner ? staticMethods.get(owner)?.has(name) : false
        if (unsupported || arrayMethods.has(name)) {
          context.report({
            node: node.property,
            messageId: 'unsupported',
            data: { name: unsupported ? `${owner}.${name}` : name },
          })
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'structuredClone'
        ) {
          context.report({
            node: node.callee,
            messageId: 'unsupported',
            data: { name: 'structuredClone' },
          })
        }
      },
    }
  },
}
