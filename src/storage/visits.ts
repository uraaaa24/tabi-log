import type { SQLiteDatabase } from 'expo-sqlite'

import { validateVisit } from '../features/records/domain/record'
import type { Photo, Transport, Visit } from '../features/records/domain/record'

type VisitRow = Readonly<{
  id: string
  place_id: string
  start_date: string
  end_date: string
  diary: string
  other_transport: string
  created_at: string
  updated_at: string
}>
export async function readVisit(
  db: SQLiteDatabase,
  id: string,
): Promise<Visit | null> {
  const row = await db.getFirstAsync<VisitRow>(
    'SELECT * FROM visits WHERE id = ?',
    id,
  )
  if (!row) {
    return null
  }
  const photos = await db.getAllAsync<Photo>(
    'SELECT id,path,thumbnail,width,height,rotation,size FROM photos WHERE visit_id = ? ORDER BY sort_order',
    id,
  )
  const transportRows = await db.getAllAsync<{ code: Transport }>(
    'SELECT code FROM visit_transports WHERE visit_id = ? ORDER BY rowid',
    id,
  )
  return {
    id: row.id,
    placeId: row.place_id,
    startDate: row.start_date,
    endDate: row.end_date,
    diary: row.diary,
    otherTransport: row.other_transport,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    photos,
    transports: transportRows.map((item) => item.code),
  }
}
export async function readHistory(
  db: SQLiteDatabase,
  placeId: string,
): Promise<Visit[]> {
  const ids = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM visits WHERE place_id = ? ORDER BY start_date DESC, created_at DESC, id DESC',
    placeId,
  )
  const visits = await Promise.all(ids.map((row) => readVisit(db, row.id)))
  return visits.filter((visit): visit is Visit => visit !== null)
}
export async function saveVisit(
  db: SQLiteDatabase,
  visit: Visit,
): Promise<void> {
  validateVisit(visit)
  await db.withExclusiveTransactionAsync(async (tx) => {
    const existing = await tx.getFirstAsync<{ place_id: string }>(
      'SELECT place_id FROM visits WHERE id = ?',
      visit.id,
    )
    if (existing && existing.place_id !== visit.placeId) {
      throw new Error('記録の場所は変更できません。')
    }
    await tx.runAsync(
      `INSERT INTO visits(id,place_id,start_date,end_date,diary,created_at,updated_at,other_transport) VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET start_date=excluded.start_date,end_date=excluded.end_date,diary=excluded.diary,updated_at=excluded.updated_at,other_transport=excluded.other_transport`,
      visit.id,
      visit.placeId,
      visit.startDate,
      visit.endDate,
      visit.diary,
      visit.createdAt,
      visit.updatedAt,
      visit.otherTransport,
    )
    await tx.runAsync('DELETE FROM photos WHERE visit_id = ?', visit.id)
    await tx.runAsync(
      'DELETE FROM visit_transports WHERE visit_id = ?',
      visit.id,
    )
    for (const [index, photo] of visit.photos.entries()) {
      await tx.runAsync(
        'INSERT INTO photos(id,visit_id,path,thumbnail,width,height,sort_order,rotation,size) VALUES (?,?,?,?,?,?,?,?,?)',
        photo.id,
        visit.id,
        photo.path,
        photo.thumbnail,
        photo.width,
        photo.height,
        index,
        photo.rotation,
        photo.size,
      )
    }
    for (const code of new Set(visit.transports)) {
      await tx.runAsync(
        'INSERT INTO visit_transports(visit_id,code) VALUES (?,?)',
        visit.id,
        code,
      )
    }
    await tx.runAsync(
      'INSERT INTO place_states(place_id,visited) VALUES (?,1) ON CONFLICT(place_id) DO UPDATE SET visited=1',
      visit.placeId,
    )
  })
}
export async function deleteVisit(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync('DELETE FROM visits WHERE id = ?', id)
}
export async function setVisited(
  db: SQLiteDatabase,
  placeId: string,
  visited: boolean,
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (!visited) {
      await tx.runAsync('DELETE FROM visits WHERE place_id = ?', placeId)
    }
    await tx.runAsync(
      'INSERT INTO place_states(place_id,visited) VALUES (?,?) ON CONFLICT(place_id) DO UPDATE SET visited=excluded.visited',
      placeId,
      visited ? 1 : 0,
    )
  })
}
