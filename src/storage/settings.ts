import type { SQLiteDatabase } from 'expo-sqlite'

import type { MapKind } from '../features/map/domain/places'

// The map shown at launch: the one last chosen, or Japan on the first launch.
export async function readLastMap(db: SQLiteDatabase): Promise<MapKind> {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key='map'",
  )
  return row?.value === 'world' ? 'world' : 'japan'
}

export async function saveLastMap(
  db: SQLiteDatabase,
  map: MapKind,
): Promise<void> {
  await db.runAsync(
    "INSERT INTO app_settings(key,value) VALUES ('map',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    map,
  )
}
