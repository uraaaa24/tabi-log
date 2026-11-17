import { X } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Modal, Pressable, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'

import { motion } from '../../components/motion'
import type { Photo } from './domain/record'
import { ZoomPhoto } from './ZoomPhoto'

type PhotoViewerProps = Readonly<{
  photos: readonly Photo[]
  index: number
  width: number
  height: number
  uriFor: (photo: Photo) => string
  onClose: () => void
}>

// A print held up close. It can be paged sideways, pinched, or pulled down
// and away to put it back; while pulled it follows the finger exactly.
export const PhotoViewer = ({
  photos,
  index,
  width,
  height,
  uriFor,
  onClose,
}: PhotoViewerProps) => {
  const insets = useSafeAreaInsets()
  const [page, setPage] = useState(index)
  const [zoomed, setZoomed] = useState(false)
  const pull = useSharedValue(0)
  const close = () => {
    onClose()
  }
  const dismiss = Gesture.Pan()
    .enabled(!zoomed)
    .maxPointers(1)
    .activeOffsetY([-14, 14])
    .failOffsetX([-12, 12])
    .onUpdate((event) => {
      pull.value = event.translationY
    })
    .onEnd((event) => {
      if (
        Math.abs(event.translationY) > 120 ||
        Math.abs(event.velocityY) > 900
      ) {
        const away = event.translationY > 0 ? height : -height
        pull.value = withTiming(away, { duration: 180 }, (finished) => {
          if (finished) {
            scheduleOnRN(onClose)
          }
        })
      } else {
        pull.value = motion.release(0)
      }
    })
  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pull.value }],
  }))
  // The room behind brightens as the print is lowered away from the eyes.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, Math.abs(pull.value) / (height * 0.6)),
  }))
  const viewHeight = height - insets.top - insets.bottom - 120
  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[
            { position: 'absolute', inset: 0, backgroundColor: '#000000' },
            backdropStyle,
          ]}
        />
        <GestureDetector gesture={dismiss}>
          <Animated.View
            style={[
              { flex: 1, justifyContent: 'center', paddingTop: insets.top },
              photoStyle,
            ]}
          >
            <FlatList
              horizontal
              pagingEnabled
              scrollEnabled={!zoomed}
              showsHorizontalScrollIndicator={false}
              data={photos}
              initialScrollIndex={index}
              getItemLayout={(_data, itemIndex) => ({
                length: width,
                offset: width * itemIndex,
                index: itemIndex,
              })}
              onMomentumScrollEnd={({ nativeEvent }) => {
                const next = Math.round(nativeEvent.contentOffset.x / width)
                if (next !== page) {
                  setPage(next)
                }
              }}
              keyExtractor={(photo) => photo.id}
              style={{ flexGrow: 0 }}
              renderItem={({ item }) => (
                <ZoomPhoto
                  photo={item}
                  uri={uriFor(item)}
                  width={width}
                  height={viewHeight}
                  onZoomChange={setZoomed}
                />
              )}
            />
          </Animated.View>
        </GestureDetector>
        <View
          pointerEvents="none"
          accessibilityLabel={`${photos.length}枚中${page + 1}枚目`}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 32,
            alignSelf: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {photos.map((photo, dot) => (
            <View
              key={photo.id}
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: dot === page ? '#FFFFFF' : '#FFFFFF59',
              }}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="写真一覧へ戻る"
          hitSlop={8}
          onPress={close}
          style={({ pressed }) => ({
            position: 'absolute',
            top: insets.top + 16,
            right: 20,
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? '#3A3A3A' : '#222222',
          })}
        >
          <X
            size={28}
            color="#FFFFFF"
            strokeWidth={2.4}
          />
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  )
}
