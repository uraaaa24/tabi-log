import { useLocalSearchParams } from 'expo-router'

import { PhotosScreen } from '../../features/records/PhotosScreen'

const Screen = () => {
  const { visitId, photoId } = useLocalSearchParams<{
    visitId: string
    photoId?: string
  }>()
  return (
    <PhotosScreen
      visitId={visitId}
      photoId={photoId}
    />
  )
}

export default Screen
