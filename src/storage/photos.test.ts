import type { SQLiteDatabase } from 'expo-sqlite'
import { beforeEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  files: new Map<string, number>(),
  directories: new Set<string>(),
  failCopy: new Set<string>(),
}))
vi.mock('expo-crypto', () => ({ randomUUID: () => 'new-photo' }))
vi.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: vi.fn(),
}))
vi.mock('expo-file-system', () => {
  const uriFor = (parts: (string | { uri: string })[]) =>
    parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/')
  class File {
    uri: string
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = uriFor(parts)
    }
    get exists() {
      return state.files.has(this.uri)
    }
    get name() {
      return this.uri.split('/').at(-1) ?? ''
    }
    get size() {
      return state.files.get(this.uri) ?? 0
    }
    async copy(target: File) {
      if (!this.exists) {
        throw new Error('missing source')
      }
      if (state.failCopy.has(target.uri)) {
        state.files.set(target.uri, 3)
        throw new Error('disk full')
      }
      state.files.set(target.uri, this.size)
    }
    async move(target: File) {
      state.files.set(target.uri, this.size)
      state.files.delete(this.uri)
    }
    delete() {
      state.files.delete(this.uri)
    }
  }
  class Directory {
    uri: string
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = uriFor(parts)
    }
    get exists() {
      return state.directories.has(this.uri)
    }
    create() {
      state.directories.add(this.uri)
    }
    list() {
      return [...state.files.keys()]
        .filter((path) => path.startsWith(`${this.uri}/`))
        .map((path) => new File(path))
    }
    delete() {
      for (const file of this.list()) {
        file.delete()
      }
      state.directories.delete(this.uri)
    }
  }
  return { File, Directory, Paths: { document: 'document', cache: 'cache' } }
})

import type { Photo } from '../features/records/domain/record'
import { collectPhotos, discardDraftPhotos, preparePhotos } from './photos'

const photo: Photo = {
  id: 'p',
  path: 'p.jpg',
  thumbnail: 'p-thumb.jpg',
  width: 100,
  height: 100,
  rotation: 1,
  size: 0.9,
}
beforeEach(() => {
  state.files.clear()
  state.directories.clear()
  state.failCopy.clear()
  state.directories.add('cache/photo-drafts')
  state.files.set('cache/photo-drafts/p.jpg', 100)
  state.files.set('cache/photo-drafts/p-thumb.jpg', 20)
})
it('永続化のコピー失敗で保存済みファイルを変えず、不完全なコピーを再試行で置き換える', async () => {
  state.files.set('document/photos/committed.jpg', 200)
  state.failCopy.add('document/photos/p.jpg.pending')
  await expect(preparePhotos([photo])).rejects.toThrow('disk full')
  expect(state.files.has('document/photos/p.jpg')).toBe(false)
  expect(state.files.get('document/photos/committed.jpg')).toBe(200)
  state.failCopy.clear()
  await preparePhotos([photo])
  expect(state.files.get('document/photos/p.jpg')).toBe(100)
  expect(state.files.get('document/photos/p-thumb.jpg')).toBe(20)
  expect(state.files.has('document/photos/p.jpg.pending')).toBe(false)
})
it('編集破棄では一時写真だけ消し、保存済み画像は消さない', async () => {
  await preparePhotos([photo])
  discardDraftPhotos()
  expect(state.files.has('cache/photo-drafts/p.jpg')).toBe(false)
  expect(state.files.get('document/photos/p.jpg')).toBe(100)
})
it('再起動後はDBの参照を守り、DB確定前の孤立画像と削除済み画像だけ回収する', async () => {
  await preparePhotos([photo])
  state.files.set('document/photos/orphan.jpg', 50)
  state.files.set('document/photos/partial.jpg.pending', 2)
  const db = {
    getAllAsync: async () => [{ path: photo.path, thumbnail: photo.thumbnail }],
  } as unknown as SQLiteDatabase
  await collectPhotos(db)
  expect([...state.files.keys()].sort()).toEqual([
    'document/photos/p-thumb.jpg',
    'document/photos/p.jpg',
  ])
  const empty = { getAllAsync: async () => [] } as unknown as SQLiteDatabase
  await collectPhotos(empty)
  expect(state.files.size).toBe(0)
})
it('DB読み込み失敗時には写真も下書きも削除しない', async () => {
  await preparePhotos([photo])
  const db = {
    getAllAsync: async () => {
      throw new Error('db unavailable')
    },
  } as unknown as SQLiteDatabase
  await expect(collectPhotos(db)).rejects.toThrow('db unavailable')
  expect(state.files.get('document/photos/p.jpg')).toBe(100)
  expect(state.files.get('cache/photo-drafts/p.jpg')).toBe(100)
})
