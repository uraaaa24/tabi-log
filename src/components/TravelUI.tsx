import { ArrowLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

export const colors = {
  background: '#F7F3EB',
  surface: '#FFFCF6',
  ink: '#362F28',
  muted: '#6E6257',
  line: '#E1D7C9',
  primary: '#88583D',
  onPrimary: '#FFFAF0',
  soft: '#EFE7DA',
  danger: '#9D3028',
  board: '#694229',
  boardText: '#FFF3DE',
  boardMuted: '#E0CEB4',
  boardBoundary: '#8A6E50',
  land: '#E0CBA6',
  pinNeedle: '#EEE5CD',
} as const

function pressOpacity(disabled: boolean, pressed: boolean) {
  if (disabled) {
    return 0.4
  }
  return pressed ? 0.65 : 1
}

type ButtonProps = Readonly<{
  label: string
  onPress: () => void
  disabled?: boolean
  danger?: boolean
  secondary?: boolean
}>

export const Button = ({
  label,
  onPress,
  disabled = false,
  danger = false,
  secondary = false,
}: ButtonProps) => {
  const backgroundColor = secondary || danger ? colors.soft : colors.primary
  const foreground = secondary ? colors.ink : colors.onPrimary
  const color = danger ? colors.danger : foreground
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        padding: 14,
        marginVertical: 4,
        borderRadius: 12,
        backgroundColor,
        opacity: pressOpacity(disabled, pressed),
        justifyContent: 'center',
      })}
    >
      <Text
        style={{ color, fontSize: 16, fontWeight: '600', textAlign: 'center' }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

type IconButtonProps = Readonly<{
  label: string
  onPress: () => void
  children: ReactNode
  disabled?: boolean
}>

export const IconButton = ({
  label,
  onPress,
  children,
  disabled = false,
}: IconButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressOpacity(disabled, pressed),
      })}
    >
      {children}
    </Pressable>
  )
}

type HeaderProps = Readonly<{
  title: string
  onBack?: () => void
  actions?: ReactNode
  foreground?: string
}>

export const Header = ({
  title,
  onBack,
  actions,
  foreground = colors.ink,
}: HeaderProps) => {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {onBack && (
        <IconButton
          label="戻る"
          onPress={onBack}
        >
          <ArrowLeft
            size={22}
            color={foreground}
            strokeWidth={1.8}
          />
        </IconButton>
      )}
      <Text
        style={{
          ...titleStyle,
          color: foreground,
          flex: 1,
          paddingLeft: onBack ? 0 : 8,
        }}
      >
        {title}
      </Text>
      {actions}
    </View>
  )
}

type PaperProps = Readonly<{
  children: ReactNode
}>

export const Paper = ({ children }: PaperProps) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: 24,
        marginVertical: 10,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      {children}
    </View>
  )
}
export const textStyle = {
  color: colors.ink,
  fontSize: 16,
  lineHeight: 26,
} as const
export const titleStyle = {
  color: colors.ink,
  fontSize: 24,
  fontWeight: '700',
} as const
