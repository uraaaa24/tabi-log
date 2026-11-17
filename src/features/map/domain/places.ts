import countries from './countries.json'
import prefectures from './prefectures.json'

export type MapKind = 'japan' | 'world'

// Japan on the world map only leads to the Japan map. Its visits belong to
// the prefectures, so it is never stored as a place of its own.
export const japanId = 'JP'

export const isPrefecture = (id: string) => id.startsWith('JP-')

// Every place a visit can belong to: the 47 prefectures and the 194 countries
// other than Japan.
export const recordablePlaces: readonly Readonly<{
  id: string
  name: string
  path: string
  x: number
  y: number
}>[] = [...prefectures, ...countries.filter((place) => place.id !== japanId)]

export function findPlace(id: string) {
  return recordablePlaces.find((place) => place.id === id)
}

// Japan carries a pin on the world map once any prefecture has one.
export function worldVisited(visited: readonly string[]): string[] {
  const abroad = visited.filter((id) => !isPrefecture(id))
  return visited.some(isPrefecture) ? [japanId, ...abroad] : abroad
}

export const japanVisited = (visited: readonly string[]) =>
  visited.filter(isPrefecture)
