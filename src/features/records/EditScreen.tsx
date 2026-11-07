import { launchImageLibraryAsync } from 'expo-image-picker'
import { router, useNavigation } from 'expo-router'
import { usePreventRemove } from 'expo-router/react-navigation'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { Button, colors, Header, Paper } from '../../components/TravelUI'
import {
  collectPhotos,
  discardDraftPhotos,
  draftPhotoUri,
  importPhoto,
  newId,
  preparePhotos,
} from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import {
  deleteVisit,
  readVisit,
  readVisitedPlaceIds,
  saveVisit,
  setVisited,
} from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { validateVisit } from './domain/record'
import type { Visit } from './domain/record'
import { RecordFields } from './RecordFields'

type EditScreenProps = Readonly<{
  placeId: string
  visitId?: string
}>

export const EditScreen = ({ placeId, visitId }: EditScreenProps) => {
  const db = useStore()
  const navigation = useNavigation()
  const [initial, setInitial] = useState<Visit | null>(null)
  const [draft, setDraft] = useState<Visit | null>(null)
  const [isPinned, setIsPinned] = useState(false)
  const [multipleDays, setMultipleDays] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [allowLeave, setAllowLeave] = useState(false)
  const [destination, setDestination] = useState<'album' | 'map' | null>(null)
  const dirty =
    JSON.stringify(initial) !== JSON.stringify(draft) ||
    (initial !== null &&
      multipleDays !== (initial.endDate !== initial.startDate))
  usePreventRemove(!allowLeave && (dirty || Boolean(busy)), ({ data }) => {
    if (busy) {
      return
    }
    Alert.alert('未保存の変更があります', '変更を破棄して戻りますか？', [
      { text: '編集を続ける', style: 'cancel' },
      {
        text: '変更を破棄して戻る',
        style: 'destructive',
        onPress: () => {
          discardDraftPhotos()
          navigation.dispatch(data.action)
        },
      },
    ])
  })
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      const pinned = (await readVisitedPlaceIds(db)).includes(placeId)
      const timestamp = new Date().toISOString()
      const visit = visitId
        ? await readVisit(db, visitId)
        : {
            id: newId(),
            placeId,
            startDate: '',
            endDate: '',
            diary: '',
            transports: [],
            otherTransport: '',
            photos: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          }
      if (!visit || visit.placeId !== placeId) {
        throw new Error('記録が見つかりません。')
      }
      if (!controller.signal.aborted) {
        setIsPinned(pinned)
        setInitial(visit)
        setDraft(visit)
        setMultipleDays(visit.endDate !== visit.startDate)
      }
    }
    load().catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        setError(
          reason instanceof Error ? reason.message : '読み込みに失敗しました。',
        )
      }
    })
    return () => {
      controller.abort()
    }
  }, [db, placeId, visitId])
  useEffect(() => {
    if (!allowLeave || !destination || !draft) {
      return
    }
    if (destination === 'album') {
      router.dismissTo({
        pathname: '/album/[visitId]',
        params: { visitId: draft.id },
      })
    } else {
      router.dismissTo('/')
    }
  }, [allowLeave, destination, draft, placeId])
  const addPhotos = async () => {
    if (!draft || busy) {
      return
    }
    setBusy('写真を選択中…')
    setError('')
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        orderedSelection: true,
        quality: 1,
      })
      if (result.canceled) {
        return
      }
      const results = []
      for (const [index, asset] of result.assets.entries()) {
        setBusy(`写真を取り込み中 ${index + 1} / ${result.assets.length}`)
        try {
          results.push({
            photo: await importPhoto(asset.uri, asset.width, asset.height),
          })
        } catch {
          results.push({ photo: null })
        }
      }
      const photos = results.flatMap((result) =>
        result.photo ? [result.photo] : [],
      )
      setDraft({ ...draft, photos: [...draft.photos, ...photos] })
      const failures = results.length - photos.length
      if (failures) {
        setError(
          `${failures}枚を取り込めませんでした。成功した${photos.length}枚は編集画面に残っています。`,
        )
      }
    } catch {
      setError('写真を開けませんでした。写真なしでも記録を保存できます。')
    } finally {
      setBusy('')
    }
  }
  const save = async () => {
    if (!draft || busy) {
      return
    }
    setError('')
    setBusy('保存中…')
    try {
      const visit = {
        ...draft,
        endDate: multipleDays ? draft.endDate : draft.startDate,
        updatedAt: new Date().toISOString(),
      }
      validateVisit(visit)
      await preparePhotos(visit.photos)
      await saveVisit(db, visit)
      await collectPhotos(db).catch(() => undefined)
      setDestination('album')
      setAllowLeave(true)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : '保存できませんでした。入力内容は残っています。',
      )
    } finally {
      setBusy('')
    }
  }
  const remove = async () => {
    if (!draft || busy) {
      return
    }
    setBusy('削除中…')
    try {
      await deleteVisit(db, draft.id)
      await collectPhotos(db).catch(() => undefined)
      setDestination('map')
      setAllowLeave(true)
    } catch {
      setError('削除できませんでした。もう一度お試しください。')
    } finally {
      setBusy('')
    }
  }
  const savePin = async () => {
    if (busy || dirty || visitId) {
      return
    }
    setBusy(isPinned ? 'ピンを外しています…' : 'ピンを残しています…')
    try {
      await setVisited(db, placeId, !isPinned)
      setDestination('map')
      setAllowLeave(true)
    } catch {
      setError('ピンを変更できませんでした。もう一度お試しください。')
    } finally {
      setBusy('')
    }
  }
  if (!draft) {
    return (
      <Paper>
        <Text>{error || '読み込み中…'}</Text>
        <Button
          label="戻る"
          onPress={() => {
            router.back()
          }}
        />
      </Paper>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={
          prefectures.find((place) => place.id === placeId)?.name ?? '旅の記録'
        }
        onBack={() => {
          router.back()
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 8 }}>
            {visitId ? '旅の思い出を編集' : '新しい旅を記録'}
          </Text>
          {Boolean(error) && (
            <Text
              accessibilityRole="alert"
              style={{ color: colors.danger, paddingVertical: 12 }}
            >
              {error}
            </Text>
          )}
          <RecordFields
            draft={draft}
            multipleDays={multipleDays}
            onChange={setDraft}
            onMultipleDaysChange={setMultipleDays}
            onAddPhotos={() => {
              addPhotos().catch(() => undefined)
            }}
            uriFor={draftPhotoUri}
          />
          {!visitId && (
            <Button
              secondary
              label={isPinned ? 'ピンを外す' : '日付なしで、ピンだけ残す'}
              disabled={dirty || Boolean(busy)}
              onPress={() => {
                savePin().catch(() => undefined)
              }}
            />
          )}
          {Boolean(visitId) && (
            <Button
              label="この旅の記録を削除"
              danger
              onPress={() => {
                Alert.alert(
                  '訪問記録を削除しますか？',
                  `写真${draft.photos.length}枚・日記・交通手段も削除されます。場所のピンは残ります。`,
                  [
                    { text: 'キャンセル', style: 'cancel' },
                    {
                      text: '削除',
                      style: 'destructive',
                      onPress: () => {
                        remove().catch(() => undefined)
                      },
                    },
                  ],
                )
              }}
            />
          )}
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            backgroundColor: colors.surface,
          }}
        >
          <Button
            label="旅の記録を保存"
            disabled={Boolean(busy)}
            onPress={() => {
              save().catch(() => undefined)
            }}
          />
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={Boolean(busy)}
        transparent
        onRequestClose={() => undefined}
      >
        <View
          accessibilityViewIsModal
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#2B312DDD',
            gap: 20,
          }}
        >
          <ActivityIndicator color="#fff4dc" />
          <Text style={{ color: colors.surface, fontSize: 18 }}>{busy}</Text>
        </View>
      </Modal>
    </View>
  )
}
