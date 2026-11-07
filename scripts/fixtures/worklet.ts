// Build-only probe: never imported by the application or its stories.
export function offset(value: number) {
  'worklet'
  return value + 1
}
