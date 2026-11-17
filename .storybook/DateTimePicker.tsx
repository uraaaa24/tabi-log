import { Text } from 'react-native'

// ブラウザではOSの日付ダイアログを開けない。フォーム自体は製品と同じ部品を使う。
const DateTimePicker = () => {
  return <Text>日付の選択はiOS / Androidで確認してください。</Text>
}

// oxlint-disable-next-line import/no-default-export -- OS部品のdefault importをStorybookで差し替えるため。
export default DateTimePicker
