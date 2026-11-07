import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

import { commitEmojis, validateTypeEmoji } from './emoji'

describe('commit type and emoji', () => {
  it.each(Object.entries(commitEmojis))(
    'accepts %s with its emoji',
    (type, emoji) => {
      expect(validateTypeEmoji(type, `${emoji} 変更内容`)[0]).toBe(true)
    },
  )
  it.each([
    '変更内容',
    '🐛 変更内容',
    ':sparkles: 変更内容',
    '✨変更内容',
    '✨ ',
    '✨  変更内容',
  ])('rejects an invalid feat subject: %s', (subject) => {
    expect(validateTypeEmoji('feat', subject)[0]).toBe(false)
  })
  it('accepts the same emoji with or without a presentation selector', () => {
    expect(validateTypeEmoji('refactor', '♻ 処理を整理')[0]).toBe(true)
    expect(validateTypeEmoji('refactor', '♻️ 処理を整理')[0]).toBe(true)
  })
})

describe('commitlint CLI and TypeScript configuration', () => {
  it.each([
    ['feat(map): ✨ 県を選択できるようにする', true],
    ['docs: 📝 開発手順を更新', true],
    [
      'feat(storage)!: ✨ 保存形式を変更\n\nBREAKING CHANGE: 旧形式の移行が必要',
      true,
    ],
    ['feat: 記録を追加', false],
    ['fix: ✨ 保存処理を修正', false],
    ['unknown: ✨ 変更', false],
    ['✨ feat: 記録を追加', false],
    ['fix: 🐛 ', false],
  ])('%s', (message, valid) => {
    const result = spawnSync(
      process.execPath,
      ['node_modules/@commitlint/cli/cli.js', '--strict'],
      { input: `${message}\n`, encoding: 'utf8' },
    )
    expect(result.error).toBeUndefined()
    expect(result.status, result.stdout + result.stderr).toBe(valid ? 0 : 3)
  })
})
