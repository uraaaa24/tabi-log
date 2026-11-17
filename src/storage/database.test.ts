import { DatabaseSync } from 'node:sqlite'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { schema } from './schema'

// expo-sqlite is native; the store is replaced with Node's SQLite so the real
// schema and pragmas run against a real database engine.
const state = vi.hoisted(() => ({ sql: null as DatabaseSync | null }))

vi.mock('expo-sqlite', () => {
  const adapter = (sql: DatabaseSync) => {
    const db = {
      execAsync: async (source: string) => {
        sql.exec(source)
      },
      runAsync: async (query: string, ...params: (string | number)[]) =>
        sql.prepare(query).run(...params),
      getFirstAsync: async (query: string, ...params: (string | number)[]) =>
        sql.prepare(query).get(...params) ?? null,
      withExclusiveTransactionAsync: async (
        task: (tx: unknown) => Promise<void>,
      ) => {
        sql.exec('BEGIN')
        try {
          await task(db)
          sql.exec('COMMIT')
        } catch (error) {
          sql.exec('ROLLBACK')
          throw error
        }
      },
    }
    return db
  }
  return {
    openDatabaseAsync: async () => {
      if (!state.sql) {
        throw new Error('test database is not prepared')
      }
      return adapter(state.sql)
    },
  }
})

const { NewerStoreError, openStore } = await import('./database')

const tables = (sql: DatabaseSync) =>
  sql
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((row) => row.name)

describe('openStore', () => {
  beforeEach(() => {
    state.sql = new DatabaseSync(':memory:')
  })

  it('creates the schema, the 47 prefectures and the 194 other countries on first launch', async () => {
    await openStore()

    const sql = state.sql as DatabaseSync
    expect(tables(sql)).toEqual(
      expect.arrayContaining(['places', 'visits', 'photos']),
    )
    expect(sql.prepare('SELECT count(*) AS count FROM places').get()).toEqual({
      count: 241,
    })
    // Japan's visits belong to its prefectures; it is not a place of its own.
    expect(sql.prepare("SELECT id FROM places WHERE id='JP'").all()).toEqual([])
    expect(sql.prepare("SELECT name FROM places WHERE id='FR'").get()).toEqual({
      name: 'フランス',
    })
  })

  it('adds the countries to a store written by the Japan-only version without touching its records', async () => {
    const sql = state.sql as DatabaseSync
    sql.exec(schema)
    sql.exec(
      "INSERT INTO places VALUES ('JP-20','長野県'); INSERT INTO place_states VALUES ('JP-20',1); INSERT INTO visits VALUES ('v1','JP-20','2025-01-01','2025-01-01','雪','2025-01-02','2025-01-02','')",
    )

    await openStore()

    expect(sql.prepare('SELECT count(*) AS count FROM places').get()).toEqual({
      count: 241,
    })
    expect(sql.prepare('SELECT place_id, diary FROM visits').all()).toEqual([
      { place_id: 'JP-20', diary: '雪' },
    ])
    expect(sql.prepare('SELECT * FROM place_states').all()).toEqual([
      { place_id: 'JP-20', visited: 1 },
    ])
  })

  it('keeps existing records when opened again', async () => {
    await openStore()
    const sql = state.sql as DatabaseSync
    sql.exec(
      "INSERT INTO visits VALUES ('v1','JP-20','2025-01-01','2025-01-01','雪','2025-01-02','2025-01-02','')",
    )

    await openStore()

    expect(sql.prepare('SELECT diary FROM visits').all()).toEqual([
      { diary: '雪' },
    ])
  })

  it('refuses records written by a newer app version without changing them', async () => {
    const sql = state.sql as DatabaseSync
    sql.exec('PRAGMA user_version = 2; CREATE TABLE future (id TEXT);')

    await expect(openStore()).rejects.toBeInstanceOf(NewerStoreError)

    expect(tables(sql)).toEqual(['future'])
    expect(sql.prepare('PRAGMA user_version').get()).toEqual({
      user_version: 2,
    })
  })
})
