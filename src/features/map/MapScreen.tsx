import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import { photoUri } from '../../storage/photos'
import { readLastMap, saveLastMap } from '../../storage/settings'
import { useStore } from '../../storage/StoreProvider'
import {
  readLatestVisitId,
  readPinPhotos,
  readVisitedPlaceIds,
} from '../../storage/visits'
import { useRead } from '../records/useRead'
import type { MapKind } from './domain/places'
import { MapBoard } from './MapBoard'

export const MapScreen = () => {
  const db = useStore()
  const opening = useRef(false)
  const [selectionError, setSelectionError] = useState('')
  // Null until the map last looked at has been read.
  const [map, setMap] = useState<MapKind | null>(null)
  useEffect(() => {
    readLastMap(db)
      .then(setMap)
      .catch(() => {
        setMap('japan')
      })
  }, [db])
  useFocusEffect(
    useCallback(() => {
      opening.current = false
    }, []),
  )
  const { value, error, reload } = useRead(
    useCallback(async () => {
      const [visited, pinPhotos] = await Promise.all([
        readVisitedPlaceIds(db),
        readPinPhotos(db),
      ])
      return {
        visited,
        photos: Object.fromEntries(
          pinPhotos.map((pin) => [pin.placeId, photoUri(pin.thumbnail)]),
        ),
      }
    }, [db]),
  )
  const openPlace = async (placeId: string) => {
    if (opening.current) {
      return
    }
    opening.current = true
    setSelectionError('')
    try {
      const visitId = await readLatestVisitId(db, placeId)
      if (visitId) {
        router.push({ pathname: '/place/[placeId]', params: { placeId } })
      } else {
        router.push({ pathname: '/edit', params: { placeId } })
      }
    } catch {
      setSelectionError('記録を開けませんでした。もう一度お試しください。')
      opening.current = false
    }
  }
  return (
    <MapBoard
      map={map ?? 'japan'}
      visited={map ? (value?.visited ?? null) : null}
      photos={value?.photos}
      loading={(value === null || map === null) && !error}
      error={error || selectionError}
      onReload={error ? reload : undefined}
      onMapChange={(next) => {
        setMap(next)
        // Remembering the choice is a convenience; the switch itself works
        // even if it cannot be saved.
        saveLastMap(db, next).catch(() => undefined)
      }}
      onSettings={() => {
        router.push('/settings')
      }}
      onSelect={(id) => {
        openPlace(id).catch(() => undefined)
      }}
    />
  )
}
