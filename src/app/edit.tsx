import { useLocalSearchParams } from 'expo-router'

import { EditScreen } from '../features/records/EditScreen'

const Screen = () => {
  const { placeId, visitId } = useLocalSearchParams<{
    placeId: string
    visitId?: string
  }>()
  return (
    <EditScreen
      placeId={placeId}
      visitId={visitId}
    />
  )
}

export default Screen
