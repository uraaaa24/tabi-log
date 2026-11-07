import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const multilineProps: Rule = {
  meta: {
    type: 'layout',
    schema: [],
    fixable: 'whitespace',
    messages: {
      multiline:
        'Put each Props member and the enclosing braces on separate lines.',
    },
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        if (!node.id.name.endsWith('Props')) {
          return
        }
        const annotation = node.typeAnnotation
        const candidates =
          annotation.type === 'TSTypeReference'
            ? (annotation.typeArguments?.params ?? [])
            : [annotation]
        for (const literal of candidates) {
          if (
            literal.type !== 'TSTypeLiteral' ||
            literal.members.length === 0
          ) {
            continue
          }
          const crowded = literal.members.filter((member, index) => {
            const previousLine =
              literal.members[index - 1]?.loc.end.line ?? literal.loc.start.line
            return member.loc.start.line <= previousLine
          })
          const last = literal.members[literal.members.length - 1]
          const closing = context.sourceCode.getLastToken(literal)
          const crowdedClosing =
            closing !== null && closing.loc.start.line <= last.loc.end.line
          if (crowded.length === 0 && !crowdedClosing) {
            continue
          }
          context.report({
            node: literal,
            messageId: 'multiline',
            fix(fixer) {
              return [
                ...crowded.map((member) =>
                  fixer.insertTextBefore(member, '\n'),
                ),
                ...(crowdedClosing && closing
                  ? [fixer.insertTextBefore(closing, '\n')]
                  : []),
              ]
            },
          })
        }
      },
    }
  },
}
