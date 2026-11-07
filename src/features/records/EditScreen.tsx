import { launchImageLibraryAsync } from 'expo-image-picker'
import { router, useNavigation } from 'expo-router'
import { usePreventRemove } from 'expo-router/react-navigation'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Button, Paper, textStyle, titleStyle } from '../../components/TravelUI'
import {
  collectPhotos,
  discardDraftPhotos,
  draftPhotoUri,
  importPhoto,
  newId,
  preparePhotos,
} from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { deleteVisit, readVisit, saveVisit } from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { DateField } from './DateField'
import { transports, validateVisit } from './domain/record'
import type { Visit } from './domain/record'

type EditScreenProps = Readonly<{
  placeId: string
  visitId?: string
}>

export const EditScreen = ({ placeId, visitId }: EditScreenProps) => {
  const db = useStore()
  const navigation = useNavigation()
  const [initial, setInitial] = useState<Visit | null>(null)
  const [draft, setDraft] = useState<Visit | null>(null)
  const [multipleDays, setMultipleDays] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [allowLeave, setAllowLeave] = useState(false)
  const [destination, setDestination] = useState<'album' | 'place' | null>(null)
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
      router.dismissTo({ pathname: '/place/[placeId]', params: { placeId } })
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
      setDestination('place')
      setAllowLeave(true)
    } catch {
      setError('削除できませんでした。もう一度お試しください。')
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
    <View style={{ flex: 1, backgroundColor: '#f2e6cf' }}>
      <ScrollView
        contentContainerStyle={{ padding: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        <Button
          label="戻る"
          disabled={Boolean(busy)}
          onPress={() => {
            router.back()
          }}
        />
        <Text style={titleStyle}>
          {prefectures.find((place) => place.id === placeId)?.name}の
          {visitId ? '訪問を編集' : '訪問を追加'}
        </Text>
        {error && (
          <Text
            accessibilityRole="alert"
            style={{ color: '#9d3028', paddingVertical: 12 }}
          >
            {error}
          </Text>
        )}
        <Paper>
          <DateField
            label="訪問日"
            value={draft.startDate}
            onChange={(value) => {
              setDraft({ ...draft, startDate: value })
            }}
          />
          <Text style={textStyle}>複数日の旅</Text>
          <Switch
            accessibilityLabel="複数日の旅"
            value={multipleDays}
            onValueChange={setMultipleDays}
          />
          {multipleDays && (
            <DateField
              label="終了日"
              value={draft.endDate}
              onChange={(value) => {
                setDraft({ ...draft, endDate: value })
              }}
            />
          )}
        </Paper>
        <Paper>
          <Text style={textStyle}>日記・メモ</Text>
          <TextInput
            accessibilityLabel="日記・メモ"
            multiline
            value={draft.diary}
            onChangeText={(value) => {
              setDraft({ ...draft, diary: value })
            }}
            placeholder="旅の思い出を書き留める"
            style={{ ...textStyle, minHeight: 140, textAlignVertical: 'top' }}
          />
        </Paper>
        <Paper>
          <Text style={textStyle}>ここへ来た交通手段（複数選択）</Text>
          {transports.map((code) => (
            <View
              key={code}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={textStyle}>{code}</Text>
              <Switch
                accessibilityLabel={code}
                value={draft.transports.includes(code)}
                onValueChange={(checked) => {
                  setDraft({
                    ...draft,
                    transports: checked
                      ? [...draft.transports, code]
                      : draft.transports.filter((item) => item !== code),
                  })
                }}
              />
            </View>
          ))}
          {draft.transports.includes('その他') && (
            <TextInput
              accessibilityLabel="その他の交通手段"
              value={draft.otherTransport}
              onChangeText={(value) => {
                setDraft({ ...draft, otherTransport: value })
              }}
              style={textStyle}
              placeholder="交通手段を入力"
            />
          )}
        </Paper>
        <Paper>
          <Button
            label="写真を追加"
            onPress={() => {
              addPhotos().catch(() => undefined)
            }}
          />
          {draft.photos.map((photo) => (
            <View key={photo.id}>
              <Image
                source={{ uri: draftPhotoUri(photo) }}
                style={{
                  width: '100%',
                  aspectRatio: photo.width / photo.height,
                }}
                resizeMode="contain"
              />
              <Button
                label="この写真を外す"
                onPress={() => {
                  Alert.alert(
                    '写真を外しますか？',
                    '保存するまで削除は確定しません。',
                    [
                      { text: 'キャンセル', style: 'cancel' },
                      {
                        text: '外す',
                        style: 'destructive',
                        onPress: () => {
                          setDraft({
                            ...draft,
                            photos: draft.photos.filter(
                              (item) => item.id !== photo.id,
                            ),
                          })
                        },
                      },
                    ],
                  )
                }}
              />
            </View>
          ))}
        </Paper>
        <Button
          label="保存"
          disabled={Boolean(busy)}
          onPress={() => {
            save().catch(() => undefined)
          }}
        />
        {visitId && (
          <Button
            label="この訪問記録を削除"
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
            backgroundColor: '#30281bd9',
            gap: 20,
          }}
        >
          <ActivityIndicator color="#fff4dc" />
          <Text style={{ color: '#fff4dc', fontSize: 18 }}>{busy}</Text>
        </View>
      </Modal>
    </View>
  )
}
