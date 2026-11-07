import { useLocalSearchParams } from 'expo-router'

import { AlbumScreen } from '../../features/records/AlbumScreen'

const Screen = () => {
  const { visitId } = useLocalSearchParams<{
    visitId: string
    photoId?: string
  }>()
  return <AlbumScreen visitId={visitId} />
}

export default Screen
