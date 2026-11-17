import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Platform, Text, View } from 'react-native'

import { Button, colors } from '../../components/TravelUI'
import { localDate } from './domain/record'

type DateFieldProps = Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
}>

// iOS shows an inline spinner confirmed by a button; other platforms open a
// dialog that reports the chosen date itself.
const inline = Platform.OS === 'ios'

export const DateField = ({ label, value, onChange }: DateFieldProps) => {
  const [today] = useState(() => new Date())
  const [selection, setSelection] = useState(today)
  const [open, setOpen] = useState(false)
  return (
    <View>
      <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 4 }}>
        {label}
      </Text>
      <Button
        secondary
        label={value || '日付を選択'}
        accessibilityLabel={`${label}：${value || '未選択'}`}
        onPress={() => {
          setSelection(value ? new Date(`${value}T12:00:00`) : new Date())
          setOpen(true)
        }}
      />
      {open && (
        <>
          <DateTimePicker
            value={selection}
            mode="date"
            display={inline ? 'spinner' : 'default'}
            maximumDate={today}
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
