import type { RuleTester } from 'oxlint/plugins-dev'

type Rule = Parameters<RuleTester['run']>[1]

export const requireDisableRules: Rule = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      missingRules:
        'Name the specific lint rules to disable; disabling all rules is forbidden.',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const directive =
            /^\s*(?:oxlint|eslint)-disable(?:-next-line|-line)?(?=\s|$)([\s\S]*)$/u.exec(
              comment.value,
            )
          if (!directive) {
            continue
          }
          const rules = directive[1].split(/\s--(?:\s|$)/u)[0]
          if (!rules.split(',').some((rule) => rule.trim().length > 0)) {
            context.report({ node: comment, messageId: 'missingRules' })
          }
        }
      },
    }
  },
}
