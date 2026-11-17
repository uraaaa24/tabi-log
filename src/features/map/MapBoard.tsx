import { Settings } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

import { Surface } from '../../components/Surface'
import { Button, colors, fonts } from '../../components/TravelUI'
import { WoodButton } from '../../components/WoodButton'
import { JapanMap } from './JapanMap'

type MapBoardProps = Readonly<{
  visited: readonly string[] | null
  photos?: Readonly<Record<string, string>>
  loading?: boolean
  error?: string
  onSelect: (id: string) => void
  onSettings: () => void
  onReload?: () => void
}>

export const MapBoard = ({
  visited,
  photos,
  loading = false,
  error = '',
  onSelect,
  onSettings,
  onReload,
}: MapBoardProps) => {
  return (
    <Surface
      kind="board"
      // A shallow inner edge, as if the board sits slightly below its frame.
      style={{
        flex: 1,
        boxShadow: 'inset 0 1px 0 #FFFFFF66, inset 0 0 14px #5E3A1E26',
      }}
    >
      <JapanMap
        visited={visited ?? []}
        ready={visited !== null}
        photos={photos}
        onSelect={(id) => {
          onSelect(id)
        }}
      />
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
        {/* Burned into the board rather than printed on a card. */}
        <Text
          accessibilityLabel={`訪れた場所 ${visited?.length ?? 0} / 47`}
          style={{
            color: colors.boardMuted,
            fontFamily: fonts.bold,
            fontSize: 15,
            opacity: 0.85,
            paddingTop: 10,
            textShadowColor: '#00000066',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {visited?.length ?? '—'}
          <Text style={{ fontSize: 12 }}> / 47</Text>
        </Text>
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
