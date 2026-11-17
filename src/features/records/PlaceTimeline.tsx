import { ArrowLeft, Plus } from 'lucide-react-native'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { motion } from '../../components/motion'
import { Polaroid } from '../../components/Polaroid'
import { Surface } from '../../components/Surface'
import { colors, fonts } from '../../components/TravelUI'
import { WoodButton } from '../../components/WoodButton'
import { PlaceSilhouette } from '../map/PlaceSilhouette'
import { DateLabel } from './DateLabel'
import { photoStyle, spokenDateLabel, visitYear } from './domain/record'

type TimelineVisit = Readonly<{
  id: string
  startDate: string
  endDate: string
  photoCount: number
  uri: string | null
}>

type VisitRowProps = Readonly<{
  visit: TimelineVisit
  onPress: () => void
}>

const VisitRow = ({ visit, onPress }: VisitRowProps) => {
  const pressed = useSharedValue(0)
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.015 }],
  }))
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${spokenDateLabel(visit)}の旅${visit.photoCount ? `、写真${visit.photoCount}枚` : ''}`}
        onPressIn={() => {
          pressed.value = motion.press(1)
        }}
        onPressOut={() => {
          pressed.value = motion.release(0)
        }}
        onPress={() => {
          onPress()
        }}
      >
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 18,
            },
            style,
          ]}
        >
          <Polaroid
            uri={visit.uri ?? undefined}
            width={136}
            aspectRatio={1.12}
            rotation={photoStyle(visit.id).rotation * 1.3}
            tape="top"
          />
          <View style={{ flex: 1 }}>
            <DateLabel
              visit={visit}
              style={{
                color: colors.ink,
                fontFamily: fonts.regular,
                fontSize: 19,
                lineHeight: 30,
              }}
            />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  )
}

type PlaceTimelineProps = Readonly<{
  placeId: string
  placeName: string
  visits: readonly TimelineVisit[]
  busy?: boolean
  error?: string
  onBack: () => void
  onOpen: (visitId: string) => void
  onAdd: () => void
  onRemovePlace: () => void
}>

// Every trip to one place, newest first, grouped under a ruled line per year
// like the dividers of a scrapbook.
export const PlaceTimeline = ({
  placeId,
  placeName,
  visits,
  busy = false,
  error = '',
  onBack,
  onOpen,
  onAdd,
  onRemovePlace,
}: PlaceTimelineProps) => {
  const years = [...new Set(visits.map(visitYear))]
  return (
    <Surface
      kind="paper"
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
      >
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={placeName}
          style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}
        >
          <PlaceSilhouette
            placeId={placeId}
            size={140}
            pinned
          />
        </View>
        {Boolean(error) && (
          <Text
            accessibilityRole="alert"
            style={{
              color: colors.danger,
              fontFamily: fonts.regular,
              paddingVertical: 8,
            }}
          >
            {error}
          </Text>
        )}
        {visits.length === 0 && (
          <Text
            style={{
              color: colors.muted,
              fontFamily: fonts.regular,
              fontSize: 16,
              textAlign: 'center',
              paddingVertical: 24,
            }}
          >
            まだ旅の記録がありません。
          </Text>
        )}
        {years.map((year) => (
          <View key={year}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                marginTop: 18,
              }}
            >
              <Text
                accessibilityRole="header"
                style={{
                  color: colors.ink,
                  fontFamily: fonts.bold,
                  fontSize: 26,
                }}
              >
                {year}年
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                  opacity: 0.85,
                  boxShadow: '0 1px 0 #FFFFFF99',
                }}
              />
            </View>
            {visits
              .filter((visit) => visitYear(visit) === year)
              .map((visit) => (
                <VisitRow
                  key={visit.id}
                  visit={visit}
                  onPress={() => {
                    onOpen(visit.id)
                  }}
                />
              ))}
          </View>
        ))}
        <View style={{ alignItems: 'center', paddingTop: 24, gap: 28 }}>
          <WoodButton
            label="新しい旅を記録"
            size={84}
            disabled={busy}
            onPress={onAdd}
          >
            <Plus
              size={40}
              color={colors.accent}
              strokeWidth={3.6}
            />
          </WoodButton>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={onRemovePlace}
            hitSlop={8}
          >
            <Text
              style={{
                color: colors.muted,
                fontFamily: fonts.regular,
                fontSize: 13,
                textDecorationLine: 'underline',
              }}
            >
              この場所のピンと記録を削除
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', top: 12, left: 16 }}>
        <WoodButton
          label="地図へ戻る"
          size={48}
          onPress={onBack}
        >
          <ArrowLeft
            size={24}
            color={colors.ink}
            strokeWidth={2.4}
          />
        </WoodButton>
      </View>
    </Surface>
  )
}
