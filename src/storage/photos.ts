import { randomUUID } from 'expo-crypto'
import { Directory, File, Paths } from 'expo-file-system'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import type { SQLiteDatabase } from 'expo-sqlite'

import { photoStyle } from '../features/records/domain/record'
import type { Photo } from '../features/records/domain/record'

const root = () => new Directory(Paths.document, 'photos')
const staging = () => new Directory(Paths.cache, 'photo-drafts')
export const photoUri = (path: string) => new File(root(), path).uri
export const newId = () => randomUUID()
export async function importPhoto(
  uri: string,
  width: number,
  height: number,
): Promise<Photo> {
  const id = newId()
  const actions =
    Math.max(width, height) > 3072
      ? [{ resize: width >= height ? { width: 3072 } : { height: 3072 } }]
      : []
  const image = await manipulateAsync(uri, actions, {
    compress: 0.88,
    format: SaveFormat.JPEG,
  })
  const thumb = await manipulateAsync(
    image.uri,
    [
      {
        resize:
          image.width >= image.height
            ? { width: Math.min(480, image.width) }
            : { height: Math.min(480, image.height) },
      },
    ],
    { compress: 0.8, format: SaveFormat.JPEG },
  )
  staging().create({ intermediates: true, idempotent: true })
  await new File(image.uri).copy(new File(staging(), `${id}.jpg`))
  await new File(thumb.uri).copy(new File(staging(), `${id}-thumb.jpg`))
  return {
    id,
    path: `${id}.jpg`,
    thumbnail: `${id}-thumb.jpg`,
    width: image.width,
    height: image.height,
    ...photoStyle(id),
  }
}
export const draftPhotoUri = (photo: Photo) => {
  const file = new File(staging(), photo.path)
  return file.exists ? file.uri : photoUri(photo.path)
}
export async function preparePhotos(photos: readonly Photo[]): Promise<void> {
  root().create({ intermediates: true, idempotent: true })
  for (const photo of photos) {
    for (const path of [photo.path, photo.thumbnail]) {
      const target = new File(root(), path)
      if (!target.exists) {
        const pending = new File(root(), `${path}.pending`)
        if (pending.exists) {
          pending.delete()
        }
        await new File(staging(), path).copy(pending)
        if (!pending.exists || !pending.size) {
          throw new Error('写真のコピーに失敗しました。')
        }
        await pending.move(target)
      }
      if (!target.exists || target.size === 0) {
        throw new Error(
          '写真を保存できませんでした。空き容量を確認してください。',
        )
      }
    }
  }
}
export function discardDraftPhotos(): void {
  if (staging().exists) {
    staging().delete()
  }
}
// Only run when no editor/save is active. DB is authoritative after a commit or restart.
export async function collectPhotos(db: SQLiteDatabase): Promise<void> {
  const paths = await db.getAllAsync<{ path: string; thumbnail: string }>(
    'SELECT path,thumbnail FROM photos',
  )
  const referenced = new Set(paths.flatMap((row) => [row.path, row.thumbnail]))
  if (root().exists) {
    for (const entry of root().list()) {
      if (entry instanceof File && !referenced.has(entry.name)) {
        entry.delete()
      }
    }
  }
  discardDraftPhotos()
}
