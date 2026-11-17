import { Settings } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

import { Surface } from '../../components/Surface'
import { Button, colors, fonts } from '../../components/TravelUI'
import { WoodButton } from '../../components/WoodButton'
import { japanId, japanVisited, worldVisited } from './domain/places'
import type { MapKind } from './domain/places'
import { JapanMap } from './JapanMap'
import { MapSwitch } from './MapSwitch'
import { WorldMap } from './WorldMap'

type MapBoardProps = Readonly<{
  map: MapKind
  // Every visited place: prefectures and countries.
  visited: readonly string[] | null
  photos?: Readonly<Record<string, string>>
  loading?: boolean
  error?: string
  onSelect: (id: string) => void
  onMapChange: (map: MapKind) => void
  onSettings: () => void
  onReload?: () => void
}>

export const MapBoard = ({
  map,
  visited,
  photos,
  loading = false,
  error = '',
  onSelect,
  onMapChange,
  onSettings,
  onReload,
}: MapBoardProps) => {
  const inJapan = japanVisited(visited ?? [])
  const abroad = worldVisited(visited ?? [])
  return (
    <Surface
      kind="board"
      // A shallow inner edge, as if the board sits slightly below its frame.
      style={{
        flex: 1,
        boxShadow: 'inset 0 1px 0 #FFFFFF66, inset 0 0 14px #5E3A1E26',
      }}
    >
      {/* Both maps stay mounted so each keeps its zoom and position while
      the other is shown. */}
      <View style={{ flex: 1, display: map === 'japan' ? 'flex' : 'none' }}>
        <JapanMap
          visited={inJapan}
          ready={visited !== null}
          photos={photos}
          onSelect={(id) => {
            onSelect(id)
          }}
        />
      </View>
      <View style={{ flex: 1, display: map === 'world' ? 'flex' : 'none' }}>
        <WorldMap
          visited={abroad}
          ready={visited !== null}
          photos={photos}
          onSelect={(id) => {
            // Japan's records belong to its prefectures: open the Japan map.
            if (id === japanId) {
              onMapChange('japan')
            } else {
              onSelect(id)
            }
          }}
        />
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 12,
          left: 20,
          right: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        {/* No visited count: the board shows pins, not a score. */}
        <MapSwitch
          value={map}
          onChange={onMapChange}
        />
        <WoodButton
          label="設定"
          size={44}
          onPress={onSettings}
        >
          <Settings
            size={20}
            color={colors.boardText}
            strokeWidth={2}
          />
        </WoodButton>
      </View>
      {Boolean(error) && (
        <View
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 32,
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#2A1408E6',
            gap: 8,
          }}
        >
          <Text
            accessibilityRole="alert"
            style={{ color: '#FFD0BE', fontFamily: fonts.regular }}
          >
            {error}
          </Text>
          {onReload && (
            <Button
              secondary
              label="再読み込み"
              onPress={onReload}
            />
          )}
        </View>
      )}
      {loading && (
        <ActivityIndicator
          accessibilityLabel="地図を読み込み中"
          color={colors.boardText}
          style={{ position: 'absolute', alignSelf: 'center', top: '50%' }}
        />
      )}
    </Surface>
  )
}
