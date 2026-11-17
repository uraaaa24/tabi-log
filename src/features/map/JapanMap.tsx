import mapFrame from './domain/map-frame.json'
import prefectures from './domain/prefectures.json'
import { PlaceMap } from './PlaceMap'

type JapanMapProps = Readonly<{
  visited: readonly string[]
  ready?: boolean
  photos?: Readonly<Record<string, string>>
  onSelect: (id: string) => void
}>

export const JapanMap = (props: JapanMapProps) => {
  return (
    <PlaceMap
      {...props}
      places={prefectures}
      frame={mapFrame}
      maxScale={6}
    />
  )
}
