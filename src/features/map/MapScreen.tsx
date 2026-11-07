import { router, useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'

import { useStore } from '../../storage/StoreProvider'
import { readLatestVisitId, readVisitedPlaceIds } from '../../storage/visits'
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
    useCallback(() => readVisitedPlaceIds(db), [db]),
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
        router.push({ pathname: '/album/[visitId]', params: { visitId } })
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
      visited={value}
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
