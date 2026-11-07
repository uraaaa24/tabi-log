import { SafeAreaView } from 'react-native-safe-area-context'

import { PaperCard } from '../components/PaperCard'

const IndexScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <PaperCard
        title="旅の記録"
        description="小さな旅も、大切な思い出。"
      />
    </SafeAreaView>
  )
}

export default IndexScreen
