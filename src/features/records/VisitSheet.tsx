import { Check, X } from 'lucide-react-native'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'

import {
  Button,
  colors,
  IconButton,
  titleStyle,
} from '../../components/TravelUI'
import { dateLabel } from './domain/record'

type VisitSheetProps = Readonly<{
  visible: boolean
  visits: readonly { id: string; startDate: string; endDate: string }[]
  selected: string
  onClose: () => void
  onSelect: (id: string) => void
  onAdd: () => void
  onRemovePlace: () => void
}>

export const VisitSheet = ({
  visible,
  visits,
  selected,
  onClose,
  onSelect,
  onAdd,
  onRemovePlace,
}: VisitSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: '#2B312D55',
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          accessibilityLabel="閉じる"
          accessibilityRole="button"
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '75%',
            padding: 24,
            paddingBottom: 36,
            gap: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={titleStyle}>旅の記録</Text>
            <IconButton
              label="閉じる"
              onPress={onClose}
            >
              <X
                color={colors.ink}
                size={22}
              />
            </IconButton>
          </View>
          <FlatList
            data={visits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                aria-selected={item.id === selected}
                onPress={() => {
                  onSelect(item.id)
                }}
                style={{
                  paddingVertical: 16,
                  minHeight: 56,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: colors.ink, fontSize: 16 }}>
                  {dateLabel(item)}
                </Text>
                {item.id === selected && (
                  <Check
                    size={20}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            )}
          />
          <Button
            label="新しい旅を記録"
            onPress={onAdd}
          />
          <Button
            label="この場所のピンと記録を削除"
            danger
            onPress={onRemovePlace}
          />
        </View>
      </View>
    </Modal>
  )
}
