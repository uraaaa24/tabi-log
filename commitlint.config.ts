import type { UserConfig } from '@commitlint/types'

import { commitEmojis, typeEmoji } from './scripts/commit/emoji.ts'

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [{ rules: { 'type-emoji': typeEmoji } }],
  rules: {
    'type-enum': [2, 'always', Object.keys(commitEmojis)],
    'type-emoji': [2, 'always'],
  },
} satisfies UserConfig
