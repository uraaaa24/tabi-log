import { router } from 'expo-router'
import { ChevronDown, Pencil, Plus } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'

import {
  Button,
  colors,
  Header,
  IconButton,
  Paper,
  textStyle,
} from '../../components/TravelUI'
import { collectPhotos, photoUri } from '../../storage/photos'
import { useStore } from '../../storage/StoreProvider'
import { readVisit, readVisitDates, setVisited } from '../../storage/visits'
import prefectures from '../map/domain/prefectures.json'
import { dateLabel } from './domain/record'
import { ScrapPhoto } from './ScrapPhoto'
import { useRead } from './useRead'
import { VisitSheet } from './VisitSheet'

type AlbumScreenProps = Readonly<{
  visitId: string
}>

export const AlbumScreen = ({ visitId }: AlbumScreenProps) => {
  const db = useStore()
  const [showVisits, setShowVisits] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [actionError, setActionError] = useState('')
  const { value, error, reload } = useRead(
    useCallback(async () => {
      const visit = await readVisit(db, visitId)
      return {
        visit,
        dates: visit ? await readVisitDates(db, visit.placeId) : [],
      }
    }, [db, visitId]),
  )
  const visit = value?.visit
  const removePlace = async () => {
    if (!visit || removing) {
      return
    }
    setRemoving(true)
    try {
      await setVisited(db, visit.placeId, false)
      await collectPhotos(db).catch(() => undefined)
      router.dismissTo('/')
    } catch {
      setActionError('削除できませんでした。もう一度お試しください。')
    } finally {
      setRemoving(false)
    }
  }
  if (!visit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header
          title="旅の記録"
          onBack={() => {
            router.dismissTo('/')
          }}
        />
        <Paper>
          <Text style={textStyle}>
            {error || '記録を読み込み中、または記録が見つかりません。'}
          </Text>
          <Button
            secondary
            label="再読み込み"
            onPress={reload}
          />
        </Paper>
      </View>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={
          prefectures.find((place) => place.id === visit.placeId)?.name ??
          'アルバム'
        }
        onBack={() => {
          router.dismissTo('/')
        }}
        actions={
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              label="新しい旅を記録"
              disabled={removing}
              onPress={() => {
                router.push({
                  pathname: '/edit',
                  params: { placeId: visit.placeId },
                })
              }}
            >
              <Plus
                size={22}
                color={colors.ink}
                strokeWidth={1.8}
              />
            </IconButton>
            <IconButton
              label="この旅を編集"
              disabled={removing}
              onPress={() => {
                router.push({
                  pathname: '/edit',
                  params: { placeId: visit.placeId, visitId },
                })
              }}
            >
              <Pencil
                size={20}
                color={colors.ink}
                strokeWidth={1.8}
              />
            </IconButton>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="訪問履歴を切り替える"
          disabled={removing}
          onPress={() => {
            setShowVisits(true)
          }}
          style={{
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              ...textStyle,
              fontSize: 18,
              fontWeight: '600',
              flexShrink: 1,
            }}
          >
            {dateLabel(visit)}
          </Text>
          <ChevronDown
            size={18}
            color={colors.muted}
          />
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {value?.dates.length}回の旅
          </Text>
        </Pressable>
        {Boolean(actionError) && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.danger }}
          >
            {actionError}
          </Text>
        )}
        {visit.transports.length > 0 && (
          <Text style={{ color: colors.muted, fontSize: 14, marginBottom: 16 }}>
            {visit.transports
              .map((code) => (code === 'その他' ? visit.otherTransport : code))
              .join(' · ')}
          </Text>
        )}
        {visit.photos.slice(0, 2).map((photo) => (
          <ScrapPhoto
            key={photo.id}
            photo={photo}
            uri={photoUri(photo.thumbnail)}
            onPress={() => {
              router.push({
                pathname: '/photos/[visitId]',
                params: { visitId, photoId: photo.id },
              })
            }}
          />
        ))}
        {visit.photos.length > 2 && (
          <Button
            secondary
            label={`写真をすべて見る · ${visit.photos.length}枚`}
            onPress={() => {
              router.push({
                pathname: '/photos/[visitId]',
                params: { visitId },
              })
            }}
          />
        )}
        {visit.diary.length > 0 && (
          <Paper>
            <Text style={textStyle}>{visit.diary}</Text>
          </Paper>
        )}
        {visit.photos.length === 0 && visit.diary.length === 0 && (
          <Paper>
            <Text style={{ ...textStyle, color: colors.muted }}>
              この旅の思い出を、写真や言葉で残しましょう。
            </Text>
            <Button
              secondary
              label="思い出を追加"
              onPress={() => {
                router.push({
                  pathname: '/edit',
                  params: { placeId: visit.placeId, visitId },
                })
              }}
            />
          </Paper>
        )}
      </ScrollView>
      <VisitSheet
        visible={showVisits}
        visits={value?.dates ?? []}
        selected={visitId}
        onClose={() => {
          setShowVisits(false)
        }}
        onSelect={(id) => {
          setShowVisits(false)
          if (id !== visitId) {
            router.replace({
              pathname: '/album/[visitId]',
              params: { visitId: id },
            })
          }
        }}
        onAdd={() => {
          setShowVisits(false)
          router.push({ pathname: '/edit', params: { placeId: visit.placeId } })
        }}
        onRemovePlace={() => {
          setShowVisits(false)
          Alert.alert(
            'この場所の記録を削除しますか？',
            `${value?.dates.length ?? 0}回の旅・写真${value?.dates.reduce((total, item) => total + item.photoCount, 0) ?? 0}枚・日記と地図のピンを削除します。元に戻せません。`,
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: '削除',
                style: 'destructive',
                onPress: () => {
                  removePlace().catch(() => undefined)
                },
              },
            ],
          )
        }}
      />
    </View>
  )
}
