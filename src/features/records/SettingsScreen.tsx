import { router } from 'expo-router'
import { Alert, Linking, ScrollView, Text, View } from 'react-native'

import {
  Button,
  colors,
  Header,
  Paper,
  textStyle,
} from '../../components/TravelUI'

export const SettingsScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="設定"
        onBack={() => {
          router.back()
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Paper>
          <Text style={{ ...textStyle, fontWeight: '600' }}>地図について</Text>
          <Text style={textStyle}>
            出典：地球地図日本（国土地理院）。GeoJSONへの変換・都道府県名とIDの付与：dataofjapan/land。アプリの木製パーツ風の表示用に県の輪郭や小島を簡略化し、座標・配色を加工しています。
          </Text>
          <Button
            secondary
            label="国土地理院の原典"
            onPress={() => {
              Linking.openURL(
                'https://www.gsi.go.jp/kankyochiri/gm_jpn.html',
              ).catch(() => {
                Alert.alert('リンクを開けませんでした')
              })
            }}
          />
          <Button
            secondary
            label="配布元・利用条件"
            onPress={() => {
              Linking.openURL(
                'https://github.com/dataofjapan/land/blob/c686f194db009794b63b38585af060fbe1b0b304/README.md',
              ).catch(() => {
                Alert.alert('リンクを開けませんでした')
              })
            }}
          />
        </Paper>
      </ScrollView>
    </View>
  )
}
