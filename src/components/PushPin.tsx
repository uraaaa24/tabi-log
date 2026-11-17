import { useId } from 'react'
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg'

import { colors } from './TravelUI'

type PushPinProps = Readonly<{
  size?: number
  shadow?: boolean
}>

// A matte round-headed map pin, lit softly from the top left. The
// needle tip is at x = size / 2 on the bottom edge of the drawing (size × 1.5
// tall), which is where callers anchor it; the extra width on the right holds
// the shadow the head casts down and to the right.
export const PushPin = ({ size = 28, shadow = true }: PushPinProps) => {
  const id = useId().replaceAll(':', '')
  const r = size / 2
  const height = size * 1.5
  const tip = height - size * 0.04
  return (
    <Svg
      width={size * 1.5}
      height={height}
      viewBox={`0 0 ${size * 1.5} ${height}`}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient
          id={`${id}shadow`}
          cx="50%"
          cy="50%"
          r="50%"
        >
          <Stop
            offset="0"
            stopColor="#3B2416"
            stopOpacity={0.4}
          />
          <Stop
            offset="0.6"
            stopColor="#3B2416"
            stopOpacity={0.16}
          />
          <Stop
            offset="1"
            stopColor="#3B2416"
            stopOpacity={0}
          />
        </RadialGradient>
        <RadialGradient
          id={`${id}head`}
          cx="42%"
          cy="38%"
          r="65%"
        >
          <Stop
            offset="0"
            stopColor="#C9452B"
          />
          <Stop
            offset="1"
            stopColor="#A5321D"
          />
        </RadialGradient>
        <LinearGradient
          id={`${id}needle`}
          x1="0"
          x2="1"
          y1="0"
          y2="0"
        >
          <Stop
            offset="0"
            stopColor="#6F6A63"
          />
          <Stop
            offset="0.45"
            stopColor="#F2EFEA"
          />
          <Stop
            offset="1"
            stopColor="#5E5953"
          />
        </LinearGradient>
      </Defs>
      {shadow && (
        <>
          {/* The needle's thin shadow, then the head's soft one further out:
          the higher a part is, the further its shadow falls from it. */}
          <Path
            d={`M${r} ${tip} L${r + size * 0.26} ${tip - size * 0.18}`}
            stroke="#3B2416"
            strokeOpacity={0.28}
            strokeWidth={size * 0.07}
            strokeLinecap="round"
          />
          <Ellipse
            cx={r + size * 0.16}
            cy={r + size * 0.18}
            rx={r * 1.05}
            ry={r * 0.95}
            fill={`url(#${id}shadow)`}
          />
        </>
      )}
      <Path
        d={`M${r - size * 0.045} ${r} L${r + size * 0.045} ${r} L${r + size * 0.012} ${tip} L${r - size * 0.012} ${tip} Z`}
        fill={`url(#${id}needle)`}
      />
      <Circle
        cx={r}
        cy={r}
        r={r * 0.94}
        fill={`url(#${id}head)`}
      />
      <Circle
        cx={r}
        cy={r}
        r={r * 0.94}
        fill="none"
        stroke={colors.outline}
        strokeOpacity={0.85}
        strokeWidth={Math.max(0.8, size * 0.05)}
      />
    </Svg>
  )
}
