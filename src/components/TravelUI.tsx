import { ArrowLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

export const colors = {
  // Every screen sits on the same light board as the map.
  background: '#E5D7BF',
  surface: '#FBF7EF',
  ink: '#3B2416',
  muted: '#7A6352',
  line: '#CDBB9F',
  primary: '#6B3E22',
  onPrimary: '#FFF8EC',
  // Card laid on the board: fields, placeholders and quiet surfaces.
  soft: '#F4ECDD',
  danger: '#B83A1F',
  accent: '#D9482B',
  stone: '#8F877E',
  // Light plain pin board behind the map; text on it uses the ink colours.
  board: '#E5D7BF',
  boardText: '#3B2416',
  boardMuted: '#6B5240',
  boardBoundary: '#4A2A15',
  // The pen colour of every hand-drawn outline, matching the map borders.
  outline: '#4A2A15',
  land: '#C99A66',
  landPressed: '#DDB27E',
  // The shadow a cut-out piece casts on the board.
  landShadow: '#5E3A1E59',
  pinNeedle: '#B9B2A8',
  photoFrame: '#FFFDF8',
  tape: '#EFE6D2',
} as const

// Shippori Mincho is bundled with the app and loaded before the first screen.
export const fonts = {
  regular: 'ShipporiMincho_500Medium',
  bold: 'ShipporiMincho_700Bold',
} as const

function pressOpacity(disabled: boolean, pressed: boolean) {
  if (disabled) {
    return 0.4
  }
  return pressed ? 0.65 : 1
}

type ButtonProps = Readonly<{
  label: string
  accessibilityLabel?: string
  onPress: () => void
  disabled?: boolean
  danger?: boolean
  secondary?: boolean
}>

export const Button = ({
  label,
  accessibilityLabel,
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
      accessibilityLabel={accessibilityLabel}
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
        style={{
          color,
          fontFamily: fonts.bold,
          fontSize: 16,
          textAlign: 'center',
        }}
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
  fontFamily: fonts.regular,
  fontSize: 16,
  lineHeight: 28,
} as const
export const titleStyle = {
  color: colors.ink,
  fontFamily: fonts.bold,
  fontSize: 24,
} as const
