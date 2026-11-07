import { openDatabaseAsync } from 'expo-sqlite'
import type { SQLiteDatabase } from 'expo-sqlite'

import prefectures from '../features/map/domain/prefectures.json'
import { schema } from './schema'

export async function openStore(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync('tabi-log.db')
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
  const version = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  )
  if ((version?.user_version ?? 0) > 1) {
    throw new Error(
      'このアプリより新しい形式の記録です。アプリを更新してください。',
    )
  }
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(schema)
    for (const place of prefectures) {
      await tx.runAsync(
        'INSERT OR IGNORE INTO places(id,name) VALUES (?,?)',
        place.id,
        place.name,
      )
    }
  })
  return db
}
