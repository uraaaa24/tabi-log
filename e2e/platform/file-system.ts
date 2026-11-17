// Browser E2E substitute for expo-file-system (Metro alias under TABI_E2E=1).
// It reproduces the native semantics the app relies on: async copy/move that
// fail when the destination exists, delete that fails for missing paths and a
// store that survives a page reload like the app's document directory.
// Contents are kept as data URIs. A stored file's `uri` is its data URI so
// <Image> can display it like a native file:// URI.

type Store = Readonly<{
  files: Record<string, string>
  directories: string[]
}>

const storageKey = 'tabi-log:e2e-file-system'

function load(): Store {
  const saved = window.localStorage.getItem(storageKey)
  return saved ? (JSON.parse(saved) as Store) : { files: {}, directories: [] }
}

function save(store: Store): void {
  window.localStorage.setItem(storageKey, JSON.stringify(store))
}

const join = (parent: string, name: string) =>
  `${parent.replace(/\/+$/, '')}/${name}`

const parentOf = (uri: string) => uri.replace(/\/[^/]+\/?$/, '')

const nameOf = (uri: string) => uri.replace(/\/+$/, '').replace(/^.*\//, '')

function byteLength(dataUri: string): number {
  const [header = '', body = ''] = dataUri.split(',', 2)
  return header.endsWith(';base64')
    ? Math.floor((body.length * 3) / 4) - (body.match(/=+$/)?.[0].length ?? 0)
    : decodeURIComponent(body).length
}

async function readExternal(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    return uri
  }
  const blob = await (await fetch(uri)).blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error(`読み込めないファイルです: ${uri}`))
      }
    }
    reader.onerror = () => {
      reject(new Error(`読み込めないファイルです: ${uri}`))
    }
    reader.readAsDataURL(blob)
  })
}

type Parent = Directory | File | string

const resolveUri = (parent: Parent, names: readonly string[]) =>
  names.reduce(
    (uri, name) => join(uri, name),
    typeof parent === 'string' ? parent : parent.location,
  )

export class Directory {
  readonly location: string

  constructor(parent: Parent, ...names: string[]) {
    this.location = resolveUri(parent, names)
  }

  get uri(): string {
    return this.location
  }

  get name(): string {
    return nameOf(this.location)
  }

  get exists(): boolean {
    return load().directories.includes(this.location)
  }

  create(
    options: Readonly<{ intermediates?: boolean; idempotent?: boolean }> = {},
  ): void {
    const store = load()
    if (store.directories.includes(this.location)) {
      if (options.idempotent) {
        return
      }
      throw new Error(`既に存在します: ${this.location}`)
    }
    const parent = parentOf(this.location)
    const isRoot = Object.values(Paths).some(
      (directory) => directory.location === parent,
    )
    if (!isRoot && !store.directories.includes(parent)) {
      if (!options.intermediates) {
        throw new Error(`親フォルダがありません: ${this.location}`)
      }
      new Directory(parent).create(options)
    }
    const latest = load()
    save({ ...latest, directories: [...latest.directories, this.location] })
  }

  delete(): void {
    const store = load()
    if (!store.directories.includes(this.location)) {
      throw new Error(`削除対象がありません: ${this.location}`)
    }
    const inside = (uri: string) =>
      uri === this.location || uri.startsWith(`${this.location}/`)
    save({
      files: Object.fromEntries(
        Object.entries(store.files).filter(([uri]) => !inside(uri)),
      ),
      directories: store.directories.filter((uri) => !inside(uri)),
    })
  }

  list(): (Directory | File)[] {
    const store = load()
    const children = (uri: string) => parentOf(uri) === this.location
    return [
      ...store.directories.filter(children).map((uri) => new Directory(uri)),
      ...Object.keys(store.files)
        .filter(children)
        .map((uri) => new File(uri)),
    ]
  }
}

export class File {
  readonly location: string

  constructor(parent: Parent, ...names: string[]) {
    this.location = resolveUri(parent, names)
  }

  get uri(): string {
    return load().files[this.location] ?? this.location
  }

  get name(): string {
    return nameOf(this.location)
  }

  get exists(): boolean {
    return this.location in load().files || this.location.startsWith('data:')
  }

  get size(): number {
    const content = load().files[this.location]
    return content === undefined ? 0 : byteLength(content)
  }

  delete(): void {
    const store = load()
    if (!(this.location in store.files)) {
      throw new Error(`削除対象がありません: ${this.location}`)
    }
    save({
      ...store,
      files: Object.fromEntries(
        Object.entries(store.files).filter(([uri]) => uri !== this.location),
      ),
    })
  }

  async copy(destination: Directory | File): Promise<void> {
    const target =
      destination instanceof Directory
        ? join(destination.location, this.name)
        : destination.location
    const content =
      load().files[this.location] ?? (await readExternal(this.location))
    const store = load()
    if (!store.directories.includes(parentOf(target))) {
      throw new Error(`保存先のフォルダがありません: ${target}`)
    }
    if (target in store.files) {
      throw new Error(`既に存在します: ${target}`)
    }
    save({ ...store, files: { ...store.files, [target]: content } })
  }

  async move(destination: Directory | File): Promise<void> {
    await this.copy(destination)
    this.delete()
  }
}

export const Paths = {
  document: new Directory('file:///e2e/document'),
  cache: new Directory('file:///e2e/cache'),
}
