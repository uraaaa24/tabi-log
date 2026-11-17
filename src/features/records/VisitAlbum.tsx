import { ArrowLeft, Pencil } from 'lucide-react-native'
import { ScrollView, Text, View } from 'react-native'

import { Polaroid } from '../../components/Polaroid'
import { Surface } from '../../components/Surface'
import { Button, colors, fonts } from '../../components/TravelUI'
import { WoodButton } from '../../components/WoodButton'
import { PlaceSilhouette } from '../map/PlaceSilhouette'
import { DateLabel } from './DateLabel'
import { photoStyle, spokenDateLabel } from './domain/record'
import type { Photo, Visit } from './domain/record'
import { MorePhotos } from './MorePhotos'
import { TransportIcon } from './TransportIcon'

const Divider = () => {
  return (
    <View
      style={{
        width: 2,
        alignSelf: 'stretch',
        marginVertical: 10,
        backgroundColor: colors.primary,
        opacity: 0.7,
      }}
    />
  )
}

type VisitAlbumProps = Readonly<{
  placeName: string
  visit: Visit
  width: number
  uriFor: (photo: Photo) => string
  error?: string
  onBack: () => void
  onEdit: () => void
  onOpenPhoto: (photoId: string) => void
  onOpenAll: () => void
}>

// One trip as a page of a paper album: where and when across the top, the
// first prints taped down, then the diary written underneath.
export const VisitAlbum = ({
  placeName,
  visit,
  width,
  uriFor,
  error = '',
  onBack,
  onEdit,
  onOpenPhoto,
  onOpenAll,
}: VisitAlbumProps) => {
  const preview = visit.photos.slice(0, 2)
  const transports = visit.transports.map((code) =>
    code === 'その他' ? visit.otherTransport : code,
  )
  const printWidth = Math.min(width - 48, 420) * 0.86
  return (
    <Surface
      kind="paper"
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={`${placeName}、${spokenDateLabel(visit)}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              flex: 1,
            }}
          >
            <PlaceSilhouette
              placeId={visit.placeId}
              size={64}
            />
            <Divider />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.ink,
                  fontFamily: fonts.bold,
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                {placeName}
              </Text>
              <DateLabel
                visit={visit}
                style={{
                  color: colors.ink,
                  fontFamily: fonts.bold,
                  fontSize: 21,
                  lineHeight: 30,
                }}
              />
            </View>
          </View>
          {transports.length > 0 && (
            <>
              <Divider />
              <View
                accessible
                accessibilityLabel={`交通手段：${transports.join('、')}`}
                style={{
                  flexDirection: 'row',
                  gap: 4,
                  flexWrap: 'wrap',
                  maxWidth: 76,
                }}
              >
                {visit.transports.slice(0, 4).map((code) => (
                  <TransportIcon
                    key={code}
                    code={code}
                    size={visit.transports.length > 1 ? 30 : 40}
                    color={colors.accent}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        {Boolean(error) && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.danger, fontFamily: fonts.regular }}
          >
            {error}
          </Text>
        )}
        {preview.map((photo, index) => (
          <View
            key={photo.id}
            style={{
              alignSelf: index ? 'flex-end' : 'flex-start',
              marginTop: index ? -4 : 8,
              marginBottom: 14,
            }}
          >
            <Polaroid
              uri={uriFor(photo)}
              kind="print"
              width={printWidth}
              aspectRatio={photo.width / photo.height}
              rotation={
                (index ? 1.6 : -1.8) + photoStyle(photo.id).rotation * 0.4
              }
              tape="top"
              label={`写真${index + 1}を拡大`}
              onPress={() => {
                onOpenPhoto(photo.id)
              }}
            />
            {index === 1 && visit.photos.length > 2 && (
              <View style={{ position: 'absolute', right: -18, bottom: -40 }}>
                <MorePhotos
                  total={visit.photos.length}
                  remaining={visit.photos.length - 2}
                  uris={visit.photos.slice(2, 4).map(uriFor)}
                  onPress={onOpenAll}
                />
              </View>
            )}
          </View>
        ))}
        {visit.diary.length > 0 && (
          <View style={{ paddingTop: visit.photos.length > 2 ? 44 : 16 }}>
            <Text
              selectable
              style={{
                color: colors.ink,
                fontFamily: fonts.regular,
                fontSize: 17,
                lineHeight: 34,
                letterSpacing: 1,
              }}
            >
              {visit.diary}
            </Text>
          </View>
        )}
        {visit.photos.length === 0 && visit.diary.length === 0 && (
          <View style={{ paddingTop: 24, gap: 12 }}>
            <Text
              style={{
                color: colors.muted,
                fontFamily: fonts.regular,
                fontSize: 16,
                lineHeight: 28,
              }}
            >
              この旅の思い出を、写真や言葉で残しましょう。
            </Text>
            <Button
              secondary
              label="思い出を追加"
              onPress={onEdit}
            />
          </View>
        )}
      </ScrollView>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 24,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <WoodButton
          label="この旅を編集"
          onPress={onEdit}
        >
          <Pencil
            size={28}
            color={colors.ink}
            strokeWidth={2.2}
          />
        </WoodButton>
        <WoodButton
          label="旅の一覧へ戻る"
          onPress={onBack}
        >
          <ArrowLeft
            size={30}
            color={colors.ink}
            strokeWidth={2.4}
          />
        </WoodButton>
      </View>
    </Surface>
  )
}
