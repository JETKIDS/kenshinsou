export type Exercise = {
  id: string
  title: string
  description: string
  durationSeconds: number
  videoSrc: string
}

export const exercises: Exercise[] = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1
  const padded = String(number).padStart(2, '0')

  return {
    id: `taisou-${padded}`,
    title: `古式健身操 動作 ${padded}`,
    description: '切り抜き済みの体操動画です。動きの流れに合わせてゆっくり行います。',
    durationSeconds: 60,
    videoSrc: `/taisou/${number}.mp4`,
  }
})
