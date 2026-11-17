export type BundleMode = 'product' | 'storybook'

export function checkBundleSources(
  sources: readonly string[],
  mode: BundleMode,
) {
  const paths = sources.map((source) => source.replaceAll('\\', '/'))
  const failures: string[] = []
  const contains = (suffix: string) =>
    paths.some((source) => source.endsWith(suffix))
  const sharedUi =
    mode === 'product'
      ? 'src/components/TravelUI.tsx'
      : 'src/components/PaperCard.tsx'
  if (!contains(sharedUi)) {
    failures.push(`Shared UI is missing: ${sharedUi}`)
  }
  if (mode === 'product') {
    if (!contains('src/app/index.tsx')) {
      failures.push('Product screen is missing')
    }
    const leaked = paths.filter((source) =>
      /(^|\/)(\.rnstorybook|\.storybook|@storybook|storybook)(\/|@)|\.stories\.|@storybook\+/.test(
        source,
      ),
    )
    if (leaked.length > 0) {
      failures.push(`Storybook leaked into product: ${leaked.join(', ')}`)
    }
  } else {
    for (const required of [
      '.rnstorybook/index.ts',
      'src/components/PaperCard.stories.tsx',
    ]) {
      if (!contains(required)) {
        failures.push(`Native Storybook source missing: ${required}`)
      }
    }
    if (
      !paths.some((source) =>
        source.includes('/@storybook/react-native-ui-lite/'),
      )
    ) {
      failures.push('Native Storybook LiteUI is missing')
    }
    if (paths.some((source) => /(^|\/)src\/app\//.test(source))) {
      failures.push('Product routes leaked into native Storybook')
    }
  }
  return failures
}
