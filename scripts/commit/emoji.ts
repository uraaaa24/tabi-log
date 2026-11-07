import type { RuleOutcome, SyncRule } from '@commitlint/types'

export const commitEmojis = {
  feat: '✨',
  fix: '🐛',
  docs: '📝',
  refactor: '♻️',
  test: '✅',
  chore: '🔧',
  style: '🎨',
  perf: '⚡️',
  build: '📦',
  ci: '👷',
  revert: '⏪️',
} as const

export const validateTypeEmoji = (
  commitType: string | null,
  subject: string | null,
): RuleOutcome => {
  const emoji = Object.entries(commitEmojis).find(
    ([type]) => type === commitType,
  )?.[1]
  // Missing and unknown types are handled by the standard commitlint rules.
  if (!emoji || !subject) {
    return [true]
  }
  // Presentation selectors do not change the identity of an emoji.
  const normalize = (text: string) => text.replace(/[\uFE0E\uFE0F]/gu, '')
  const prefix = `${normalize(emoji)} `
  const normalizedSubject = normalize(subject)
  const valid =
    normalizedSubject.startsWith(prefix) &&
    /^\S/u.test(normalizedSubject.slice(prefix.length))
  return [valid, `Use "${commitType}: ${emoji} 要約" (scope is optional).`]
}

export const typeEmoji: SyncRule = (parsed) =>
  validateTypeEmoji(parsed.type, parsed.subject)
