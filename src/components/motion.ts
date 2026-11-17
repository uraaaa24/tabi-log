import { Easing, withTiming } from 'react-native-reanimated'

// The app handles paper prints and pins, so motion stops where it lands: no
// springs that overshoot, no wobble. Durations stay short and decelerate.
const settle = Easing.out(Easing.cubic)

export const motion = {
  // Finger goes down: the object gives way at once.
  press: (value: number) => {
    'worklet'
    return withTiming(value, { duration: 90, easing: settle })
  },
  // Finger lifts: the object returns without passing its resting place.
  release: (value: number) => {
    'worklet'
    return withTiming(value, { duration: 180, easing: settle })
  },
  // A print or pin is put down on the page or board.
  place: (value: number) => {
    'worklet'
    return withTiming(value, { duration: 340, easing: settle })
  },
} as const
