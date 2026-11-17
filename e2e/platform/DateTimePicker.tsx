import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

// Browser E2E substitute for @react-native-community/datetimepicker (Metro
// alias under TABI_E2E=1). It behaves like the Android dialog: mounting opens
// it, OK reports `set` with the chosen date, Cancel reports `dismissed`, and
// days after `maximumDate` cannot be chosen.

type PickerEvent = Readonly<{ type: 'set' | 'dismissed' }>

type DateTimePickerProps = Readonly<{
  value: Date
  maximumDate?: Date
  onChange: (event: PickerEvent, date?: Date) => void
}>

const format = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function parse(text: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null
  }
  const date = new Date(`${text}T12:00:00`)
  return format(date) === text ? date : null
}

const DateTimePicker = ({
  value,
  maximumDate,
  onChange,
}: DateTimePickerProps) => {
  const [text, setText] = useState(() => format(value))
  const date = parse(text)
  const selectable =
    date !== null && (!maximumDate || format(date) <= format(maximumDate))
  return (
    <View
      role="dialog"
      aria-label="日付を選択"
    >
      <TextInput
        accessibilityLabel="日付（年-月-日）"
        value={text}
        onChangeText={setText}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!selectable}
        onPress={() => {
          if (date) {
            onChange({ type: 'set' }, date)
          }
        }}
      >
        <Text>OK</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          onChange({ type: 'dismissed' })
        }}
      >
        <Text>キャンセル</Text>
      </Pressable>
    </View>
  )
}

// oxlint-disable-next-line import/no-default-export -- OS部品のdefault importをE2Eで差し替えるため。
export default DateTimePicker
