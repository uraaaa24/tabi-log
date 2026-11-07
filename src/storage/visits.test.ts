import type { SQLiteDatabase } from 'expo-sqlite'
import { DatabaseSync } from 'node:sqlite'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Visit } from '../features/records/domain/record'
import { schema } from './schema'
import {
  deleteVisit,
  readHistory,
  readVisit,
  saveVisit,
  setVisited,
} from './visits'

const makeDb = () => {
  const sql = new DatabaseSync(':memory:')
  sql.exec('PRAGMA foreign_keys=ON;')
  sql.exec(schema)
  sql.exec("INSERT INTO places VALUES ('JP-13','東京都'),('JP-20','長野県')")
  const adapter = {
    runAsync: async (query: string, ...params: (string | number)[]) =>
      sql.prepare(query).run(...params),
    getFirstAsync: async (query: string, ...params: (string | number)[]) =>
      sql.prepare(query).get(...params) ?? null,
    getAllAsync: async (query: string, ...params: (string | number)[]) =>
      sql.prepare(query).all(...params),
    withExclusiveTransactionAsync: async (
      fn: (tx: unknown) => Promise<void>,
    ) => {
      sql.exec('BEGIN')
      try {
        await fn(adapter)
        sql.exec('COMMIT')
      } catch (error) {
        sql.exec('ROLLBACK')
        throw error
      }
    },
  }
  return { db: adapter as unknown as SQLiteDatabase, sql }
}
const example: Visit = {
  id: 'visit-1',
  placeId: 'JP-13',
  startDate: '2025-04-02',
  endDate: '2025-04-02',
  diary: '桜\n思い出',
  createdAt: '2025-04-03T12:00:00Z',
  updatedAt: '2025-04-03T12:00:00Z',
  transports: ['電車', '徒歩'],
  otherTransport: '',
  photos: [
    {
      id: 'photo-1',
      path: 'photo-1.jpg',
      thumbnail: 'photo-1-thumb.jpg',
      width: 800,
      height: 600,
      rotation: -1.2,
      size: 0.9,
    },
  ],
}
describe('端末内の記録と関連データ', () => {
  const context: { db: SQLiteDatabase; sql: DatabaseSync }[] = []
  beforeEach(() => {
    context.splice(0, context.length, makeDb())
  })
  const current = () => {
    const value = context[0]
    if (!value) {
      throw new Error('missing db')
    }
    return value
  }
  it('写真・交通手段・訪問済みをまとめて保存し再表示する', async () => {
    const { db, sql } = current()
    await saveVisit(db, example)
    expect(await readVisit(db, example.id)).toEqual(example)
    expect(sql.prepare('SELECT visited FROM place_states').get()?.visited).toBe(
      1,
    )
  })
  it('写真挿入失敗では既存の日記・写真・ピンまで巻き戻す', async () => {
    const { db } = current()
    await saveVisit(db, example)
    await expect(
      saveVisit(db, {
        ...example,
        diary: '失敗する変更',
        photos: [
          { ...example.photos[0], width: -1 } as Visit['photos'][number],
        ],
      }),
    ).rejects.toThrow()
    expect(await readVisit(db, example.id)).toEqual(example)
  })
  it('作成日時を維持し、日付重複を許可、並び順は更新日時に依存しない', async () => {
    const { db } = current()
    await saveVisit(db, example)
    await saveVisit(db, {
      ...example,
      id: 'visit-2',
      createdAt: '2025-04-04T12:00:00Z',
      photos: [],
    })
    await saveVisit(db, {
      ...example,
      createdAt: '2030-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    })
    expect((await readHistory(db, 'JP-13')).map((visit) => visit.id)).toEqual([
      'visit-2',
      'visit-1',
    ])
    expect((await readVisit(db, example.id))?.createdAt).toBe(example.createdAt)
  })
  it('個別削除ではピンを残し、未訪問化では当該県の関連記録だけ削除する', async () => {
    const { db, sql } = current()
    await saveVisit(db, example)
    await deleteVisit(db, example.id)
    expect(sql.prepare('SELECT visited FROM place_states').get()?.visited).toBe(
      1,
    )
    expect(
      sql.prepare('SELECT count(*) AS count FROM photos').get()?.count,
    ).toBe(0)
    await saveVisit(db, example)
    await saveVisit(db, {
      ...example,
      id: 'other',
      placeId: 'JP-20',
      photos: [],
    })
    await setVisited(db, 'JP-13', false)
    expect(await readVisit(db, example.id)).toBeNull()
    expect(await readVisit(db, 'other')).not.toBeNull()
    expect(
      sql
        .prepare(
          'SELECT count(*) AS count FROM visit_transports WHERE visit_id=?',
        )
        .get(example.id)?.count,
    ).toBe(0)
  })
  it('場所の変更と未知の県への保存を拒否する', async () => {
    const { db } = current()
    await saveVisit(db, example)
    await expect(
      saveVisit(db, { ...example, placeId: 'JP-20' }),
    ).rejects.toThrow('場所')
    await expect(
      saveVisit(db, { ...example, id: 'new', placeId: 'unknown', photos: [] }),
    ).rejects.toThrow()
    expect(await readVisit(db, 'new')).toBeNull()
  })
})
