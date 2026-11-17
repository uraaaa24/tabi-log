import { useEffect, useState } from 'react'

import medium from '../node_modules/@expo-google-fonts/shippori-mincho/500Medium/ShipporiMincho_500Medium.ttf?url'
import bold from '../node_modules/@expo-google-fonts/shippori-mincho/700Bold/ShipporiMincho_700Bold.ttf?url'

// expo-fontはexpo-modules-coreを読み込み、Viteの事前変換で失敗する。
// 製品と同じフォント名で、ブラウザのFontFaceに同じファイルを登録する。
const faces = {
  ShipporiMincho_500Medium: medium,
  ShipporiMincho_700Bold: bold,
}
const style = document.createElement('style')
style.textContent = Object.entries(faces)
  .map(([name, url]) => `@font-face{font-family:${name};src:url(${url});}`)
  .join('')
document.head.append(style)
const ready = Promise.all(
  Object.keys(faces).map((name) => document.fonts.load(`16px ${name}`)),
)

export function useFonts(_map: Record<string, unknown>) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    ready.then(
      () => {
        setLoaded(true)
      },
      (reason: unknown) => {
        setError(reason instanceof Error ? reason : new Error(String(reason)))
      },
    )
  }, [])
  return [loaded, error] as const
}
