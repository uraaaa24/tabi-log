import { openDatabaseAsync } from 'expo-sqlite'
import type { SQLiteDatabase } from 'expo-sqlite'

import { recordablePlaces } from '../features/map/domain/places'
import { schema } from './schema'

// The records were written by a newer app version; writing them could corrupt them.
export class NewerStoreError extends Error {
  constructor() {
    super('このアプリより新しい形式の記録です。アプリを更新してください。')
    this.name = 'NewerStoreError'
  }
}

export async function openStore(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync('tabi-log.db')
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
  const version = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  )
  if ((version?.user_version ?? 0) > 1) {
    throw new NewerStoreError()
  }
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(schema)
    for (const place of recordablePlaces) {
      await tx.runAsync(
        'INSERT OR IGNORE INTO places(id,name) VALUES (?,?)',
        place.id,
        place.name,
      )
    }
  })
  return db
}
