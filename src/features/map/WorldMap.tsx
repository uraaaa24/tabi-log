import countries from './domain/countries.json'
import worldFrame from './domain/world-frame.json'
import worldLand from './domain/world-land.json'
import { PlaceMap } from './PlaceMap'

const japan = countries.find((place) => place.id === 'JP')

type WorldMapProps = Readonly<{
  // Country ids; 'JP' stands for Japan as a whole.
  visited: readonly string[]
  ready?: boolean
  photos?: Readonly<Record<string, string>>
  onSelect: (id: string) => void
}>

// The 195 countries centred on the Pacific. Territories and disputed areas
// outside them are drawn as land that cannot be chosen. The world is zoomed
// further than Japan so that small European and island states can be reached.
// A wide map on a tall screen would be a thin strip, so it opens zoomed in to
// the screen's height around Japan; pinching out still shows the whole world.
export const WorldMap = (props: WorldMapProps) => {
  return (
    <PlaceMap
      {...props}
      places={countries}
      frame={worldFrame}
      land={worldLand.path}
      maxScale={20}
      initialFocus={japan}
    />
  )
}
