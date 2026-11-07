import { useState } from 'react'
import { Platform, ScrollView, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg'

import { Button } from '../../components/TravelUI'
import prefectures from './domain/prefectures.json'

type JapanMapProps = Readonly<{
  visited: readonly string[]
  onSelect: (id: string) => void
}>

export const JapanMap = ({ visited, onSelect }: JapanMapProps) => {
  const [zoom, setZoom] = useState(1)
  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onEnd((event) => {
      setZoom((current) =>
        Math.max(1, Math.min(5, Math.round(current * event.scale))),
      )
    })
  return (
    <View style={{ flex: 1, backgroundColor: '#65462e' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button
          label="拡大 ＋"
          disabled={zoom >= 5}
          onPress={() => {
            setZoom(zoom + 1)
          }}
        />
        <Button
          label="縮小 −"
          disabled={zoom <= 1}
          onPress={() => {
            setZoom(zoom - 1)
          }}
        />
        <Button
          label="全体表示"
          onPress={() => {
            setZoom(1)
          }}
        />
      </View>
      <Text style={{ color: '#fff5df', padding: 12 }}>
        訪れた場所 {visited.length} / 47県　県をタップして旅を記録
      </Text>
      <ScrollView horizontal>
        <ScrollView>
          <GestureDetector gesture={pinch}>
            <Svg
              width={360 * zoom}
              height={600 * zoom}
              viewBox="0 0 550 760"
            >
              <Defs>
                <LinearGradient
                  id="land"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop
                    offset="0"
                    stopColor="#e7c795"
                  />
                  <Stop
                    offset="1"
                    stopColor="#b88d58"
                  />
                </LinearGradient>
                <Pattern
                  id="grain"
                  width="60"
                  height="35"
                  patternUnits="userSpaceOnUse"
                >
                  <Rect
                    width="60"
                    height="35"
                    fill="#65462e"
                  />
                  <Path
                    d="M0 8 Q30 1 60 8 M0 25 Q30 38 60 25"
                    stroke="#775438"
                    fill="none"
                    strokeWidth="2"
                  />
                </Pattern>
              </Defs>
              <Rect
                width="550"
                height="760"
                fill="url(#grain)"
              />
              {prefectures.map((place) => (
                <G
                  key={place.id}
                  accessible
                  accessibilityRole={
                    Platform.OS === 'web' ? undefined : 'button'
                  }
                  accessibilityLabel={`${place.name}、${visited.includes(place.id) ? '訪問済み' : '未訪問'}`}
                  onPress={() => {
                    onSelect(place.id)
                  }}
                >
                  <Path
                    d={place.path}
                    fill="url(#land)"
                    stroke="#62472f"
                    strokeWidth={0.8}
                  />
                  {zoom > 1 && (
                    <SvgText
                      x={place.x}
                      y={place.y + 8}
                      fontSize={5}
                      textAnchor="middle"
                      fill="#3f3024"
                    >
                      {place.name}
                    </SvgText>
                  )}
                  {visited.includes(place.id) && (
                    <G>
                      <Circle
                        cx={place.x + 1}
                        cy={place.y + 1}
                        r={4}
                        fill="#44251f"
                        opacity={0.4}
                      />
                      <Line
                        x1={place.x}
                        y1={place.y}
                        x2={place.x - 1}
                        y2={place.y + 5}
                        stroke="#ddd1b4"
                        strokeWidth={1.4}
                      />
                      <Circle
                        cx={place.x}
                        cy={place.y - 2}
                        r={3.5}
                        fill="#a53c32"
                      />
                      <Circle
                        cx={place.x - 1}
                        cy={place.y - 3}
                        r={1}
                        fill="#ef9b7b"
                      />
                    </G>
                  )}
                </G>
              ))}
            </Svg>
          </GestureDetector>
        </ScrollView>
      </ScrollView>
      <Text style={{ color: '#ead9bd', fontSize: 11, padding: 8 }}>
        出典：地球地図日本（国土地理院）、dataofjapan/land。表示用に加工。
      </Text>
    </View>
  )
}
