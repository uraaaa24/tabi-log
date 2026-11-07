import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const noLet: Rule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      preferConst:
        'Use const instead of let. If mutation improves clarity or performance, document the reason in a local disable comment.',
    },
  },
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === 'let') {
          context.report({ node, messageId: 'preferConst' })
        }
      },
    }
  },
}
