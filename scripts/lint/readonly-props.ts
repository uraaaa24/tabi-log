import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const readonlyProps: Rule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      requireReadonly: 'Wrap the entire Props type in Readonly<...>.',
    },
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        if (!node.id.name.endsWith('Props')) {
          return
        }
        const annotation = node.typeAnnotation
        if (
          annotation.type === 'TSTypeReference' &&
          annotation.typeName.type === 'Identifier' &&
          annotation.typeName.name === 'Readonly' &&
          annotation.typeArguments?.params.length === 1
        ) {
          return
        }
        context.report({ node, messageId: 'requireReadonly' })
      },
    }
  },
}
