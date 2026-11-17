export const transports = [
  '車',
  '電車',
  '新幹線',
  '飛行機',
  'バス',
  '船',
  '徒歩',
  '自転車',
  'その他',
] as const
export type Transport = (typeof transports)[number]
export type Photo = Readonly<{
  id: string
  path: string
  thumbnail: string
  width: number
  height: number
  rotation: number
  size: number
}>
export type Visit = Readonly<{
  id: string
  placeId: string
  startDate: string
  endDate: string
  diary: string
  transports: Transport[]
  otherTransport: string
  photos: Photo[]
  createdAt: string
  updatedAt: string
}>
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && localDate(date) === value
}
export function validateVisit(visit: Visit, today = localDate()) {
  if (!validDate(visit.startDate) || !validDate(visit.endDate)) {
    throw new Error('訪問日を選んでください。')
  }
  if (visit.endDate < visit.startDate) {
    throw new Error('終了日は開始日以降にしてください。')
  }
  if (visit.startDate > today || visit.endDate > today) {
    throw new Error('未来の日付は保存できません。')
  }
  if (visit.transports.some((value) => !transports.includes(value))) {
    throw new Error('交通手段が不正です。')
  }
  if (visit.transports.includes('その他') && !visit.otherTransport.trim()) {
    throw new Error('その他の交通手段を入力してください。')
  }
  if (
    new Set(visit.photos.map((photo) => photo.id)).size !== visit.photos.length
  ) {
    throw new Error('写真が重複しています。')
  }
}
const dateParts = (value: string) => {
  const [year = 0, month = 0, day = 0] = value.split('-').map(Number)
  return { year, month, day }
}
// ["2026年1月1日", "-3日"]: the end date repeats only the parts that differ,
// so a trip across a month or year boundary stays unambiguous. The parts are
// the only places a long label may wrap.
export function dateLabelParts(
  visit: Pick<Visit, 'startDate' | 'endDate'>,
): [string, string] {
  const start = dateParts(visit.startDate)
  const end = dateParts(visit.endDate || visit.startDate)
  const first = `${start.year}年${start.month}月${start.day}日`
  if (visit.startDate === visit.endDate || !visit.endDate) {
    return [first, '']
  }
  if (start.year !== end.year) {
    return [first, `-${end.year}年${end.month}月${end.day}日`]
  }
  if (start.month !== end.month) {
    return [first, `-${end.month}月${end.day}日`]
  }
  return [first, `-${end.day}日`]
}
export const dateLabel = (visit: Pick<Visit, 'startDate' | 'endDate'>) =>
  dateLabelParts(visit).join('')
// Spoken form of the label; screen readers read "-" inconsistently.
export const spokenDateLabel = (visit: Pick<Visit, 'startDate' | 'endDate'>) =>
  dateLabel(visit).replace('-', 'から')
export function slashDate(value: string) {
  const { year, month, day } = dateParts(value)
  return `${year}/${month}/${day}`
}
export const visitYear = (visit: Pick<Visit, 'startDate'>) =>
  dateParts(visit.startDate).year
export const photoStyle = (id: string) => {
  const hash = Array.from(id).reduce(
    (sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0,
    0,
  )
  return { rotation: (hash % 501) / 100 - 2.5, size: 0.84 + (hash % 13) / 100 }
}
