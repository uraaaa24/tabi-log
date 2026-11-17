module.exports = {
  // NativeWindのCSS遅延読み込み時の色設定更新に対応する。
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors: { paper: '#fff9eb', ink: '#49392b', wood: '#99734e' } },
  },
  plugins: [],
}
