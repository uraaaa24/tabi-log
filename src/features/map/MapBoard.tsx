import { Settings } from 'lucide-react-native'
import { ActivityIndicator, Text, View } from 'react-native'

import { Button, colors, Header, IconButton } from '../../components/TravelUI'
import { JapanMap } from './JapanMap'

type MapBoardProps = Readonly<{
  visited: readonly string[] | null
  loading?: boolean
  error?: string
  onSelect: (id: string) => void
  onSettings: () => void
  onReload?: () => void
}>

export const MapBoard = ({
  visited,
  loading = false,
  error = '',
  onSelect,
  onSettings,
  onReload,
}: MapBoardProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.board }}>
      <Header
        title="旅の記録"
        foreground={colors.boardText}
        actions={
          <IconButton
            label="設定"
            onPress={() => {
              onSettings()
            }}
          >
            <Settings
              size={22}
              color={colors.boardText}
              strokeWidth={1.8}
            />
          </IconButton>
        }
      />
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <Text
          style={{ color: colors.boardText, fontSize: 32, fontWeight: '600' }}
        >
          {visited?.length ?? '—'}
        </Text>
        <Text style={{ color: colors.boardMuted, fontSize: 14 }}>
          / 47　訪れた場所
        </Text>
      </View>
      {Boolean(error) && (
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            accessibilityRole="alert"
            style={{ color: '#FFD0BE' }}
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
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="地図を読み込み中"
          color={colors.boardText}
        />
      ) : null}
      <JapanMap
        visited={visited ?? []}
        onSelect={(id) => {
          onSelect(id)
        }}
      />
      <Text
        style={{
          color: colors.boardMuted,
          fontSize: 12,
          textAlign: 'center',
          paddingVertical: 16,
        }}
      >
        ピンチで拡大・縮小　ドラッグで移動
      </Text>
    </View>
  )
}
