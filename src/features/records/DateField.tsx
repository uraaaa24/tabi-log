import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Platform, Text, View } from 'react-native'

import { Button } from '../../components/TravelUI'
import { localDate } from './domain/record'

type DateFieldProps = Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
}>

export const DateField = ({ label, value, onChange }: DateFieldProps) => {
  const [today] = useState(() => new Date())
  const [selection, setSelection] = useState(today)
  const [open, setOpen] = useState(false)
  return (
    <View>
      <Button
        label={`${label}：${value || '未選択'}`}
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
            maximumDate={today}
            onChange={(event, date) => {
              if (Platform.OS === 'android') {
                setOpen(false)
              }
              if (event.type === 'set' && date) {
                setSelection(date)
                if (Platform.OS === 'android') {
                  onChange(localDate(date))
                }
              }
            }}
          />
          {Platform.OS === 'ios' && (
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
      <Text>{label}は現地の暦日のまま保存します。</Text>
    </View>
  )
}
