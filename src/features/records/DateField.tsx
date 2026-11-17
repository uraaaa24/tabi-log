import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'

import { InkOutline } from '../../components/InkOutline'
import { Button, colors, fonts } from '../../components/TravelUI'
import { localDate, slashDate } from './domain/record'

type DateFieldProps = Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
  minimum?: string
}>

// iOS shows an inline spinner confirmed by a button; other platforms open a
// dialog that reports the chosen date itself.
const inline = Platform.OS === 'ios'

export const DateField = ({
  label,
  value,
  onChange,
  minimum,
}: DateFieldProps) => {
  const [today] = useState(() => new Date())
  const [selection, setSelection] = useState(today)
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}：${value || '未選択'}`}
        onPress={() => {
          setSelection(value ? new Date(`${value}T12:00:00`) : new Date())
          setOpen(true)
        }}
        style={({ pressed }) => ({
          minHeight: 48,
          paddingHorizontal: 16,
          borderRadius: 4,
          justifyContent: 'center',
          backgroundColor: pressed ? colors.line : colors.soft,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text
          numberOfLines={1}
          style={{
            color: value ? colors.ink : colors.muted,
            fontFamily: fonts.regular,
            fontSize: 17,
          }}
        >
          {value ? slashDate(value) : label}
        </Text>
        <InkOutline radius={4} />
      </Pressable>
      {open && (
        <>
          <DateTimePicker
            value={selection}
            mode="date"
            display={inline ? 'spinner' : 'default'}
            maximumDate={today}
            minimumDate={minimum ? new Date(`${minimum}T00:00:00`) : undefined}
            onChange={(event, date) => {
              if (!inline) {
                setOpen(false)
              }
              if (event.type === 'set' && date) {
                setSelection(date)
                if (!inline) {
                  onChange(localDate(date))
                }
              }
            }}
          />
          {inline && (
            <Button
              label="この日付にする"
              onPress={() => {
                onChange(localDate(selection))
                setOpen(false)
              }}
            />
          )}
        </>
      )}
    </View>
  )
}
