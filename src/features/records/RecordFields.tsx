import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Button, colors, Paper, textStyle } from '../../components/TravelUI'
import { DateField } from './DateField'
import { transports } from './domain/record'
import type { Photo, Visit } from './domain/record'

type RecordFieldsProps = Readonly<{
  draft: Visit
  multipleDays: boolean
  onChange: (visit: Visit) => void
  onMultipleDaysChange: (value: boolean) => void
  onAddPhotos: () => void
  uriFor: (photo: Photo) => string
}>

export const RecordFields = ({
  draft,
  multipleDays,
  onChange,
  onMultipleDaysChange,
  onAddPhotos,
  uriFor,
}: RecordFieldsProps) => {
  return (
    <View>
      <Paper>
        <DateField
          label="訪問日"
          value={draft.startDate}
          onChange={(value) => {
            onChange({ ...draft, startDate: value })
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={textStyle}>複数日の旅</Text>
          <Switch
            accessibilityLabel="複数日の旅"
            value={multipleDays}
            onValueChange={onMultipleDaysChange}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {multipleDays && (
          <DateField
            label="終了日"
            value={draft.endDate}
            onChange={(value) => {
              onChange({ ...draft, endDate: value })
            }}
          />
        )}
      </Paper>
      <Paper>
        <Text style={{ ...textStyle, fontWeight: '600' }}>写真</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {draft.photos.map((photo) => (
            <View
              key={photo.id}
              style={{ width: 132 }}
            >
              <Image
                source={{ uri: uriFor(photo) }}
                style={{ width: 132, height: 132, borderRadius: 12 }}
                resizeMode="contain"
              />
              <Button
                secondary
                label="外す"
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
              />
            </View>
          ))}
        </ScrollView>
        <Button
          secondary
          label={draft.photos.length ? '写真を追加' : '思い出の写真を選ぶ'}
          onPress={() => {
            onAddPhotos()
          }}
        />
      </Paper>
      <Paper>
        <Text style={{ ...textStyle, fontWeight: '600' }}>日記・メモ</Text>
        <TextInput
          accessibilityLabel="日記・メモ"
          multiline
          value={draft.diary}
          onChangeText={(value) => {
            onChange({ ...draft, diary: value })
          }}
          placeholder="心に残った景色や、おいしかったもの。"
          placeholderTextColor={colors.muted}
          style={{ ...textStyle, minHeight: 140, textAlignVertical: 'top' }}
        />
      </Paper>
      <Paper>
        <Text style={{ ...textStyle, fontWeight: '600' }}>交通手段</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {transports.map((code) => {
            const selected = draft.transports.includes(code)
            return (
              <Pressable
                key={code}
                accessibilityRole="checkbox"
                accessibilityLabel={code}
                aria-checked={selected}
                onPress={() => {
                  onChange({
                    ...draft,
                    transports: selected
                      ? draft.transports.filter((item) => item !== code)
                      : [...draft.transports, code],
                  })
                }}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  borderRadius: 12,
                  backgroundColor: selected ? colors.primary : colors.soft,
                }}
              >
                <Text
                  style={{
                    color: selected ? colors.onPrimary : colors.ink,
                    fontSize: 14,
                  }}
                >
                  {code}
                </Text>
              </Pressable>
            )
          })}
        </View>
        {draft.transports.includes('その他') && (
          <TextInput
            accessibilityLabel="その他の交通手段"
            value={draft.otherTransport}
            onChangeText={(value) => {
              onChange({ ...draft, otherTransport: value })
            }}
            style={{
              ...textStyle,
              minHeight: 48,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
            }}
            placeholder="交通手段を入力"
          />
        )}
      </Paper>
    </View>
  )
}
