import type { SQLiteDatabase } from 'expo-sqlite'
import { DatabaseSync } from 'node:sqlite'
import { expect, it } from 'vitest'

import { schema } from './schema'
import { readLastMap, saveLastMap } from './settings'

const makeDb = () => {
  const sql = new DatabaseSync(':memory:')
  sql.exec(schema)
  const db = {
    runAsync: async (query: string, ...params: string[]) =>
      sql.prepare(query).run(...params),
    getFirstAsync: async (query: string, ...params: string[]) =>
      sql.prepare(query).get(...params) ?? null,
  }
  return { db: db as unknown as SQLiteDatabase, sql }
}

it('初回は日本地図、以降は最後に選んだ地図を開く', async () => {
  const { db } = makeDb()
  expect(await readLastMap(db)).toBe('japan')

  await saveLastMap(db, 'world')
  expect(await readLastMap(db)).toBe('world')

  await saveLastMap(db, 'japan')
  expect(await readLastMap(db)).toBe('japan')
})

it('読めない値が保存されていても日本地図を開く', async () => {
  const { db, sql } = makeDb()
  sql.exec("INSERT INTO app_settings VALUES ('map','moon')")

  expect(await readLastMap(db)).toBe('japan')
})
