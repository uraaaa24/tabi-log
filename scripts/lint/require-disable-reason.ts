import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const requireDisableReason: Rule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      missingReason:
        'Explain why this lint suppression is necessary after " -- ".',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (
            !/^\s*(?:oxlint|eslint)-disable(?:-next-line|-line)?(?=\s|$)/u.test(
              comment.value,
            )
          ) {
            continue
          }
          if (!/\s--\s+\S/u.test(comment.value)) {
            context.report({ node: comment, messageId: 'missingReason' })
          }
        }
      },
    }
  },
}
