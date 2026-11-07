module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: { colors: { paper: '#fff9eb', ink: '#49392b', wood: '#99734e' } },
  },
  plugins: [],
}
