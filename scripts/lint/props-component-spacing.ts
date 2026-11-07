import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const propsComponentSpacing: Rule = {
  meta: {
    type: 'layout',
    schema: [],
    fixable: 'whitespace',
    messages: {
      blankLine:
        'Separate the Props type from the component with a blank line.',
    },
  },
  create(context) {
    return {
      Program(program) {
        for (const [index, statement] of program.body.entries()) {
          const declaration =
            statement.type === 'ExportNamedDeclaration'
              ? statement.declaration
              : statement
          if (
            declaration?.type !== 'TSTypeAliasDeclaration' ||
            !declaration.id.name.endsWith('Props')
          ) {
            continue
          }
          const next = program.body[index + 1]
          if (!next) {
            continue
          }
          const following =
            next.type === 'ExportNamedDeclaration' ? next.declaration : next
          if (
            following?.type !== 'VariableDeclaration' ||
            !following.declarations.some(
              (item) =>
                item.id.type === 'Identifier' &&
                /^[A-Z]/u.test(item.id.name) &&
                item.init?.type === 'ArrowFunctionExpression',
            )
          ) {
            continue
          }
          const leadingComment = context.sourceCode
            .getCommentsBefore(next)
            .find(
              (comment) =>
                comment.range[0] >= statement.range[1] &&
                comment.loc.start.line > statement.loc.end.line,
            )
          const boundary = leadingComment ?? next
          if (boundary.loc.start.line - statement.loc.end.line >= 2) {
            continue
          }
          context.report({
            node: next,
            messageId: 'blankLine',
            fix(fixer) {
              const separator =
                boundary.loc.start.line === statement.loc.end.line
                  ? '\n\n'
                  : '\n'
              return fixer.insertTextBefore(boundary, separator)
            },
          })
        }
      },
    }
  },
}
