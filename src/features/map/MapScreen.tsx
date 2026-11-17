import { router, useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'

import { photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import {
  readLatestVisitId,
  readPinPhotos,
  readVisitedPlaceIds,
} from '../../storage/visits'
import { useRead } from '../records/useRead'
import { MapBoard } from './MapBoard'

export const MapScreen = () => {
  const db = useStore()
  const opening = useRef(false)
  const [selectionError, setSelectionError] = useState('')
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
      visited={value?.visited ?? null}
      photos={value?.photos}
      loading={value === null && !error}
      error={error || selectionError}
      onReload={error ? reload : undefined}
      onSettings={() => {
        router.push('/settings')
      }}
      onSelect={(id) => {
        openPlace(id).catch(() => undefined)
      }}
    />
  )
}
