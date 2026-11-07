const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Metro in SDK 58 emits indexed source maps. Inspect every embedded map, not just the first section.
export function sourceMapSources(value: unknown): string[] {
  if (!isObject(value) || value.version !== 3) {
    throw new Error('Invalid source map: expected version 3')
  }
  if ('sources' in value && 'sections' in value) {
    throw new Error('Invalid source map: both sources and sections are present')
  }
  if (
    Array.isArray(value.sources) &&
    value.sources.every(
      (source): source is string => typeof source === 'string',
    )
  ) {
    return value.sources
  }
  if (Array.isArray(value.sections) && value.sections.length > 0) {
    return value.sections.flatMap((section) => {
      if (
        !isObject(section) ||
        !isObject(section.offset) ||
        !Number.isInteger(section.offset.line) ||
        !Number.isInteger(section.offset.column) ||
        Number(section.offset.line) < 0 ||
        Number(section.offset.column) < 0 ||
        !('map' in section) ||
        'url' in section
      ) {
        throw new Error(
          'Invalid source map section: expected an offset and an embedded map',
        )
      }
      return sourceMapSources(section.map)
    })
  }
  throw new Error('Invalid source map: expected sources or non-empty sections')
}
