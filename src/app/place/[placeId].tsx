import { useLocalSearchParams } from 'expo-router'

import { PlaceScreen } from '../../features/records/PlaceScreen'

const Screen = () => {
  const { placeId } = useLocalSearchParams<{
    placeId: string
    photoId?: string
  }>()
  return <PlaceScreen placeId={placeId} />
}

export default Screen
