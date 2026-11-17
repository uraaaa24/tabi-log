import { expect, it } from 'vitest'

import {
  findPlace,
  japanVisited,
  recordablePlaces,
  worldVisited,
} from './places'

it('記録先は47都道府県と日本以外の194か国で、日本全体は記録先にしない', () => {
  expect(recordablePlaces).toHaveLength(241)
  expect(new Set(recordablePlaces.map((place) => place.id)).size).toBe(241)
  expect(findPlace('JP')).toBeUndefined()
  expect(findPlace('JP-20')?.name).toBe('長野県')
  expect(findPlace('VA')?.name).toBe('バチカン')
  expect(findPlace('TW')).toBeUndefined()
})

it('世界地図の日本は、いずれかの都道府県が訪問済みのときだけピンを持つ', () => {
  expect(worldVisited(['FR', 'US'])).toEqual(['FR', 'US'])
  expect(worldVisited(['JP-13', 'FR', 'JP-20'])).toEqual(['JP', 'FR'])
  expect(japanVisited(['JP-13', 'FR', 'JP-20'])).toEqual(['JP-13', 'JP-20'])
})
