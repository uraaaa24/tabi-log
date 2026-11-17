import { Text, View } from 'react-native'
import type { TextStyle } from 'react-native'

import { dateLabelParts, spokenDateLabel } from './domain/record'
import type { Visit } from './domain/record'

type DateLabelProps = Readonly<{
  visit: Pick<Visit, 'startDate' | 'endDate'>
  style: TextStyle
}>

// Japanese text may break between any two characters, which split "3日"
// across lines. Each part stays whole and only the range wraps.
export const DateLabel = ({ visit, style }: DateLabelProps) => {
  const [first, rest] = dateLabelParts(visit)
  return (
    <View
      accessible
      accessibilityLabel={spokenDateLabel(visit)}
      style={{ flexDirection: 'row', flexWrap: 'wrap', flexShrink: 1 }}
    >
      <Text
        numberOfLines={1}
        style={style}
      >
        {first}
      </Text>
      {Boolean(rest) && (
        <Text
          numberOfLines={1}
          style={style}
        >
          {rest}
        </Text>
      )}
    </View>
  )
}
