import {
  CalendarDays,
  Camera,
  CarFront,
  Pencil,
  Plus,
  X,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { InkOutline } from '../../components/InkOutline'
import { Polaroid } from '../../components/Polaroid'
import { colors, fonts } from '../../components/TravelUI'
import { DateField } from './DateField'
import { photoStyle, transports } from './domain/record'
import type { Photo, Visit } from './domain/record'
import { TransportToggle } from './TransportToggle'

type RowProps = Readonly<{
  icon: ReactNode
  label: string
  children: ReactNode
  stacked?: boolean
}>

// Each field is introduced by a stamped icon instead of a written label; the
// label stays available to screen readers.
const Row = ({ icon, label, children, stacked = false }: RowProps) => {
  return (
    <View
      style={{
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: stacked ? 10 : 16,
        paddingVertical: 14,
      }}
    >
      <View
        accessible
        accessibilityRole="header"
        accessibilityLabel={label}
        style={{ width: 44, alignItems: 'center' }}
      >
        {icon}
      </View>
      <View style={stacked ? undefined : { flex: 1 }}>{children}</View>
    </View>
  )
}

const iconProps = { size: 34, color: colors.primary, strokeWidth: 2.2 } as const
// Prints on the strip are pushed along when one is added or removed; nothing
// fades in or out, because paper does not.
const motionLayout = LinearTransition.duration(220)

type RecordFieldsProps = Readonly<{
  draft: Visit
  onChange: (visit: Visit) => void
  onAddPhotos: () => void
  uriFor: (photo: Photo) => string
}>

export const RecordFields = ({
  draft,
  onChange,
  onAddPhotos,
  uriFor,
}: RecordFieldsProps) => {
  return (
    <View>
      <Row
        icon={<CalendarDays {...iconProps} />}
        label="訪問日"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <DateField
            label="訪問日"
            value={draft.startDate}
            onChange={(value) => {
              // A single-day trip is the common case: the end follows the
              // start until the user picks a later end date.
              onChange({
                ...draft,
                startDate: value,
                endDate:
                  !draft.endDate || draft.endDate < value
                    ? value
                    : draft.endDate,
              })
            }}
          />
          <Text
            style={{
              color: colors.primary,
              fontFamily: fonts.bold,
              fontSize: 18,
            }}
          >
            -
          </Text>
          <DateField
            label="終了日"
            value={draft.endDate}
            minimum={draft.startDate || undefined}
            onChange={(value) => {
              onChange({ ...draft, endDate: value })
            }}
          />
        </View>
      </Row>
      <Row
        icon={<Camera {...iconProps} />}
        label="写真"
        stacked
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 14,
            paddingVertical: 14,
            paddingHorizontal: 4,
            alignItems: 'center',
          }}
        >
          {draft.photos.map((photo, index) => (
            <Animated.View
              key={photo.id}
              layout={motionLayout}
            >
              <Polaroid
                uri={uriFor(photo)}
                width={104}
                aspectRatio={1.05}
                rotation={photoStyle(photo.id).rotation * 1.2}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`写真${index + 1}を外す`}
                  hitSlop={10}
                  onPress={() => {
                    Alert.alert(
                      '写真を外しますか？',
                      '保存するまで削除は確定しません。',
                      [
                        { text: 'キャンセル', style: 'cancel' },
                        {
                          text: '外す',
                          style: 'destructive',
                          onPress: () => {
                            onChange({
                              ...draft,
                              photos: draft.photos.filter(
                                (item) => item.id !== photo.id,
                              ),
                            })
                          },
                        },
                      ],
                    )
                  }}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.danger,
                    borderWidth: 2,
                    borderColor: colors.photoFrame,
                    boxShadow: '1px 1.5px 0 #5E3A1E59',
                  }}
                >
                  <X
                    size={15}
                    color={colors.onPrimary}
                    strokeWidth={3}
                  />
                </Pressable>
              </Polaroid>
            </Animated.View>
          ))}
          <Animated.View layout={motionLayout}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                draft.photos.length ? '写真を追加' : '思い出の写真を選ぶ'
              }
              onPress={() => {
                onAddPhotos()
              }}
              style={({ pressed }) => ({
                width: 96,
                height: 104,
                borderRadius: 12,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.soft : 'transparent',
              })}
            >
              <Plus
                size={36}
                color={colors.primary}
                strokeWidth={2.6}
              />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </Row>
      <Row
        icon={<CarFront {...iconProps} />}
        label="交通手段"
        stacked
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, padding: 6 }}
        >
          {transports.map((code) => {
            const selected = draft.transports.includes(code)
            return (
              <TransportToggle
                key={code}
                code={code}
                selected={selected}
                onToggle={() => {
                  onChange({
                    ...draft,
                    transports: selected
                      ? draft.transports.filter((item) => item !== code)
                      : [...draft.transports, code],
                  })
                }}
              />
            )
          })}
        </ScrollView>
        {draft.transports.includes('その他') && (
          <View style={{ marginTop: 10 }}>
            <TextInput
              accessibilityLabel="その他の交通手段"
              value={draft.otherTransport}
              onChangeText={(value) => {
                onChange({ ...draft, otherTransport: value })
              }}
              placeholder="交通手段を入力"
              placeholderTextColor={colors.muted}
              style={{
                minHeight: 48,
                paddingHorizontal: 16,
                borderRadius: 4,
                backgroundColor: colors.soft,
                color: colors.ink,
                fontFamily: fonts.regular,
                fontSize: 16,
              }}
            />
            <InkOutline radius={4} />
          </View>
        )}
      </Row>
      <Row
        icon={<Pencil {...iconProps} />}
        label="日記"
      >
        <View>
          <TextInput
            accessibilityLabel="日記・メモ"
            multiline
            value={draft.diary}
            onChangeText={(value) => {
              onChange({ ...draft, diary: value })
            }}
            placeholder="思い出を書き残す…"
            placeholderTextColor={colors.muted}
            style={{
              minHeight: 180,
              padding: 18,
              borderRadius: 4,
              backgroundColor: colors.soft,
              color: colors.ink,
              fontFamily: fonts.regular,
              fontSize: 16,
              lineHeight: 28,
              textAlignVertical: 'top',
            }}
          />
          <InkOutline radius={4} />
        </View>
      </Row>
    </View>
  )
}
