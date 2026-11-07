import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

type ButtonProps = Readonly<{
  label: string
  onPress: () => void
  disabled?: boolean
  danger?: boolean
}>

export const Button = ({
  label,
  onPress,
  disabled = false,
  danger = false,
}: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        padding: 14,
        marginVertical: 5,
        borderRadius: 8,
        backgroundColor: danger ? '#8c3830' : '#526b56',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ color: '#fffaf0', fontSize: 16, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  )
}

type PaperProps = Readonly<{
  children: ReactNode
}>

export const Paper = ({ children }: PaperProps) => {
  return (
    <View
      style={{
        backgroundColor: '#fcf5e5',
        padding: 18,
        marginVertical: 10,
        borderRadius: 4,
        gap: 12,
        borderWidth: 1,
        borderColor: '#dfceb0',
      }}
    >
      {children}
    </View>
  )
}
export const textStyle = {
  color: '#46392c',
  fontSize: 16,
  lineHeight: 26,
} as const
export const titleStyle = {
  color: '#46392c',
  fontSize: 24,
  fontWeight: '700',
} as const
