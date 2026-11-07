import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const componentReturn: Rule = {
  meta: {
    type: 'suggestion',
    schema: [],
    fixable: 'code',
    messages: {
      explicitReturn: 'Use a block body with an explicit return in components.',
      missingReturn:
        'Return the component result explicitly; nested callbacks do not count.',
    },
  },
  create(context) {
    const components = new WeakSet<object>()
    const returned = new WeakSet<object>()
    return {
      ArrowFunctionExpression(node) {
        const isComponent = (child: typeof node.parent): boolean => {
          const parent = child.parent
          if (!parent) {
            return false
          }
          if (parent.type === 'VariableDeclarator') {
            return (
              parent.id.type === 'Identifier' && /^[A-Z]/u.test(parent.id.name)
            )
          }
          if (parent.type === 'ExportDefaultDeclaration') {
            return true
          }
          if (
            parent.type === 'TSAsExpression' ||
            parent.type === 'TSSatisfiesExpression' ||
            parent.type === 'ParenthesizedExpression'
          ) {
            return isComponent(parent)
          }
          if (
            parent.type === 'CallExpression' &&
            parent.arguments[0] === child
          ) {
            const callee = parent.callee
            const namedWrapper =
              callee.type === 'Identifier' &&
              (callee.name === 'memo' || callee.name === 'forwardRef')
            const reactWrapper =
              callee.type === 'MemberExpression' &&
              !callee.computed &&
              callee.object.type === 'Identifier' &&
              callee.object.name === 'React' &&
              callee.property.type === 'Identifier' &&
              (callee.property.name === 'memo' ||
                callee.property.name === 'forwardRef')
            return (namedWrapper || reactWrapper) && isComponent(parent)
          }
          return false
        }
        if (!isComponent(node)) {
          return
        }
        components.add(node)
        if (node.body.type === 'BlockStatement') {
          return
        }
        context.report({
          node,
          messageId: 'explicitReturn',
          fix(fixer) {
            const arrow = context.sourceCode.getTokenBefore(
              node.body,
              (token) => token.value === '=>',
            )
            if (!arrow) {
              return null
            }
            const expression = context.sourceCode.text
              .slice(arrow.range[1], node.range[1])
              .trim()
            return fixer.replaceTextRange(
              [arrow.range[1], node.range[1]],
              ` { return (${expression}) }`,
            )
          },
        })
      },
      ReturnStatement(node) {
        const findOwner = (
          ancestor: typeof node.parent,
        ): typeof node.parent | null => {
          if (
            ancestor.type === 'ArrowFunctionExpression' ||
            ancestor.type === 'FunctionExpression' ||
            ancestor.type === 'FunctionDeclaration'
          ) {
            return ancestor
          }
          return ancestor.parent ? findOwner(ancestor.parent) : null
        }
        const owner = findOwner(node.parent)
        if (owner) {
          returned.add(owner)
        }
      },
      'ArrowFunctionExpression:exit'(node) {
        if (
          components.has(node) &&
          node.body.type === 'BlockStatement' &&
          !returned.has(node)
        ) {
          context.report({ node, messageId: 'missingReturn' })
        }
      },
    }
  },
}
