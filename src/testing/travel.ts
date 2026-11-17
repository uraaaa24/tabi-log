import { photoStyle } from '../features/records/domain/record'
import type { Photo } from '../features/records/domain/record'

const image = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#b5c7c0"/><path d="M0 400L240 80L380 280L480 180L600 400" fill="#657d60"/><circle cx="470" cy="90" r="40" fill="#e5d2a3"/></svg>')}`
export const sampleImageUri = image
export const samplePhotos: Photo[] = Array.from(
  { length: 12 },
  (_value, index) => ({
    id: `sample-${index}`,
    path: `sample-${index}.jpg`,
    thumbnail: `sample-${index}-thumb.jpg`,
    width: index % 3 === 0 ? 400 : 600,
    height: index % 3 === 0 ? 600 : 400,
    ...photoStyle(`sample-${index}`),
  }),
)
