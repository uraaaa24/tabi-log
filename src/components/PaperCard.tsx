import { MapPin } from 'lucide-react-native'
import { Text, View } from 'react-native'

type PaperCardProps = Readonly<{
  title: string
  description: string
}>

export const PaperCard = ({ title, description }: PaperCardProps) => {
  return (
    <View className="gap-3 rounded-2xl bg-paper p-6">
      <View className="flex-row items-center gap-2">
        <MapPin
          color="#99734e"
          size={24}
          accessibilityElementsHidden
        />
        <Text className="text-xl font-bold text-ink">{title}</Text>
      </View>
      <Text className="text-base leading-6 text-ink">{description}</Text>
    </View>
  )
}
